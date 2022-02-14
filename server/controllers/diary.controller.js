import HttpStatus from 'http-status-codes';
import Diary, { DiaryInstance } from '../models/diary.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import Teacher from '../models/teacher.model';
import Lesson from '../models/lesson.model';
import AttType from '../models/att-type.model';
import genericController, { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getDiaryDataByGroupId, getAllAttTypesByUserId, getDiaryDataByDiaryId } from '../utils/queryHelper';
import { fillDiaryData, processAndValidateData, saveData } from '../utils/diaryHelper';
import { getDiaryMergedPdfStreamByDiaries, getDiaryStreamByDiaryId } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';
import { getListFromTable } from '../../common-modules/server/utils/common';

export const { findById, store, update, destroy, uploadMultiple } = genericController(Diary);

function getFindAllQuery(user_id, filters) {
    const dbQuery = new Diary()
        .where({ 'diaries.user_id': user_id })
        .query(qb => {
            qb.leftJoin('groups', 'groups.id', 'diaries.group_id')
            qb.leftJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.leftJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.leftJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.select('diaries.*')
            qb.select({ group_name: bookshelf.knex.raw('CONCAT_WS(" ", klasses.name, teachers.name, lessons.name)') })
        });
    applyFilters(dbQuery, filters);
    return dbQuery;
}

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = getFindAllQuery(req.currentUser.id, req.query.filters);
    const countQuery = dbQuery.clone().query(qb => { qb.clearSelect(); qb.clearGroup(); }).count();
    dbQuery.query(qb => {
        qb.groupBy('diaries.id')
        qb.leftJoin('diary_lessons', 'diary_lessons.diary_id', 'diaries.id')
        qb.min({ first_lesson: 'diary_lessons.lesson_date' })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

/**
 * Get Diary Data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getDiaryData(req, res) {
    const { body: { groupId, diaryId } } = req;
    const groupData = await getDiaryDataByGroupId(groupId);
    const attTypes = await getAllAttTypesByUserId(req.currentUser.id);
    if (diaryId) {
        groupData.diaryId = diaryId;
        const diaryData = await getDiaryDataByDiaryId(diaryId);
        fillDiaryData(diaryData, groupData);
    }
    res.json({
        error: null,
        data: { groupData, attTypes }
    });
}

export async function saveDiaryData(req, res) {
    const { body: { groupId, diaryId, data, dates, lessons, isSubstitute } } = req;

    try {
        const dataToSave = processAndValidateData(req.currentUser.id, data, dates, lessons, isSubstitute);
        await saveData(req.currentUser.id, groupId, diaryId, dataToSave);
    } catch (e) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: e.message,
        });
    }

    res.json({
        error: null,
        data: { message: 'הרשומה נשמרה בהצלחה.' }
    });
}

/**
 * Print One Diary
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function printOneDiary(req, res) {
    const { body: { id, group_id } } = req;
    const { fileStream, filename } = await getDiaryStreamByDiaryId(id, group_id);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

/**
 * Print All Diaries
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
 export async function printAllDiaries(req, res) {
    const { body: { filters } } = req;
    const dbQuery = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 100 });
    if (total > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן להדפיס יותר מ100 יומנים במקביל'
        });
    }
    const { fileStream, filename } = await getDiaryMergedPdfStreamByDiaries(data);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

/**
 * report by dates
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function reportByDates(req, res) {
    const dbQuery = new DiaryInstance()
        .where({ 'diary_instances.user_id': req.currentUser.id })
        .query(qb => {
            qb.innerJoin('students', 'students.tz', 'diary_instances.student_tz')
            qb.innerJoin('diary_lessons', 'diary_lessons.id', 'diary_instances.diary_lesson_id')
            qb.innerJoin('diaries', 'diaries.id', 'diary_lessons.diary_id')
            qb.innerJoin('groups', 'groups.id', 'diaries.group_id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.leftJoin('student_klasses', 'student_klasses.student_tz', 'students.tz',)
            qb.leftJoin({ klasses2: 'klasses' }, 'klasses2.key', 'student_klasses.klass_id')
            qb.whereNotNull('diary_instances.student_att_key')
            qb.where('klasses2.klass_type_id', 1)
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: bookshelf.knex.raw('GROUP_CONCAT(DISTINCT(klasses2.name) SEPARATOR ", ")'),
            absences_1: bookshelf.knex.raw('COUNT(if(klasses.klass_type_id = 1, diary_instances.student_att_key, null))'),
            absences_2: bookshelf.knex.raw('COUNT(if(klasses.klass_type_id = 2, diary_instances.student_att_key, null))'),
            absences_3: bookshelf.knex.raw('COUNT(if(klasses.klass_type_id = 3, diary_instances.student_att_key, null))'),
            absences_null: bookshelf.knex.raw('COUNT(if(klasses.klass_type_id is null, diary_instances.student_att_key, null))'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getEditData(req, res) {
    const [students, klasses, teachers, lessons, attTypes] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
        getListFromTable(AttType, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { students, klasses, teachers, lessons, attTypes }
    });
}

export async function getPivotData(req, res) {
    const studentFilters = [];
    const reportFilters = [];
    if (req.query.filters) {
        const filtersObj = JSON.parse(req.query.filters);
        for (const filter of Object.values(filtersObj)) {
            if (filter.field.startsWith('students')) {
                studentFilters.push(filter);
            } else if (filter.field.startsWith('klasses')) {
                studentFilters.push(filter);
                reportFilters.push(filter);
            } else {
                reportFilters.push(filter);
            }
        }
    }

    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_klasses', 'student_klasses.student_tz', 'students.tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
            qb.leftJoin({ student_klasses2: 'student_klasses' }, 'student_klasses2.student_tz', 'students.tz',)
            qb.leftJoin({ klasses2: 'klasses' }, 'klasses2.key', 'student_klasses2.klass_id')
            qb.where('klasses2.klass_type_id', 1)
            qb.groupBy('students.id')
            qb.distinct('students.tz', 'students.name')
            qb.select({
                student_base_klass: bookshelf.knex.raw('GROUP_CONCAT(DISTINCT(klasses2.name) SEPARATOR ", ")'),
            })
        });

    applyFilters(dbQuery, JSON.stringify(studentFilters));
    const countQuery = dbQuery.clone().query()
        .clearSelect()
        .clearGroup()
        .countDistinct({ count: ['students.id', 'students.name'] })
        .then(res => res[0].count);
    const studentsRes = await fetchPagePromise({ dbQuery, countQuery }, req.query);

    const pivotQuery = new DiaryInstance()
        .where('diary_instances.student_tz', 'in', studentsRes.data.map(item => item.tz))
        .query(qb => {
            qb.innerJoin('diary_lessons', 'diary_lessons.id', 'diary_instances.diary_lesson_id')
            qb.innerJoin('diaries', 'diaries.id', 'diary_lessons.diary_id')
            qb.innerJoin('groups', 'groups.id', 'diaries.group_id')
            qb.innerJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.innerJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.select('diary_instances.*')
            qb.select({
                teacher_name: 'teachers.name',
                lesson_name: 'lessons.name',
            })
        });

    applyFilters(pivotQuery, JSON.stringify(reportFilters));
    const pivotRes = await fetchPagePromise({ dbQuery: pivotQuery }, { page: 0, pageSize: 1000 * req.query.pageSize, /* todo:orderBy */ });

    const pivotData = studentsRes.data;
    const pivotDict = pivotData.reduce((prev, curr) => ({ ...prev, [curr.tz]: curr }), {});
    pivotRes.data.forEach(item => {
        if (pivotDict[item.student_tz].total === undefined) {
            pivotDict[item.student_tz].total = 0;
        }
        const key = item.lesson_name + '_' + item.teacher_name;
        if (pivotDict[item.student_tz][key] === undefined) {
            pivotDict[item.student_tz][key] = 0;
            pivotDict[item.student_tz][key + '_title'] = (item.lesson_name || 'לא ידוע') + ' ' + (item.teacher_name || 'לא ידוע');
        }
        if (item.student_att_key === 2) {
            pivotDict[item.student_tz][key] += 1;
            pivotDict[item.student_tz].total += 1;
        }
    })

    res.send({
        error: null,
        data: pivotData,
        page: studentsRes.page,
        total: studentsRes.total,
    })
}

export async function getAllDiaryInstances(req, res) {
    const dbQuery = new DiaryInstance()
        .where({ 'diary_instances.user_id': req.currentUser.id })
        .query(qb => {
            qb.innerJoin('students', 'students.tz', 'diary_instances.student_tz')
            qb.innerJoin('diary_lessons', 'diary_lessons.id', 'diary_instances.diary_lesson_id')
            qb.innerJoin('diaries', 'diaries.id', 'diary_lessons.diary_id')
            qb.innerJoin('groups', 'groups.id', 'diaries.group_id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.innerJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.innerJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.innerJoin('att_types', 'att_types.key', 'diary_instances.student_att_key')
            qb.leftJoin('student_klasses', 'student_klasses.student_tz', 'students.tz',)
            qb.leftJoin({ klasses2: 'klasses' }, 'klasses2.key', 'student_klasses.klass_id')
            qb.whereNotNull('diary_instances.student_att_key')
            qb.where('klasses2.klass_type_id', 1)
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['diary_instances.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('diary_instances.id')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: bookshelf.knex.raw('GROUP_CONCAT(DISTINCT(klasses2.name) SEPARATOR ", ")'),
            teacher_name: 'teachers.name',
            klass_name: 'klasses.name',
            lesson_name: 'lessons.name',
            att_type_name: 'att_types.name',
            lesson_date: 'diary_lessons.lesson_date',
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getDiaryLessons(req, res) {
    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_base_klass', 'student_base_klass.student_tz', 'students.tz',)
            qb.join('diaries')
            qb.innerJoin('groups', 'groups.id', 'diaries.group_id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.innerJoin('student_klasses', { 'student_klasses.klass_id': 'klasses.key', 'student_klasses.student_tz': 'students.tz' })
            qb.innerJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.innerJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.innerJoin('diary_lessons', 'diary_lessons.diary_id', 'diaries.id')
            qb.leftJoin('diary_instances', { 'diary_instances.diary_lesson_id': 'diary_lessons.id', 'diary_instances.student_tz': 'students.tz' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id', 'groups.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id', 'groups.id')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            teacher_name: 'teachers.name',
            klass_name: 'klasses.name',
            lesson_name: 'lessons.name',
        })
        qb.count({
            total_lessons: 'diary_lessons.id',
            abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 2, 1, NULL)'),
            late_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 1, 1, NULL)'),
            approved_abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 3, 1, NULL)'),
        })
        qb.select({
            abs_count_num: bookshelf.knex.raw('(count(IF(diary_instances.student_att_key = 2, 1, NULL)) * 100) / count(diary_lessons.id)'),
            abs_percents: bookshelf.knex.raw('CONCAT(ROUND((count(IF(diary_instances.student_att_key = 2, 1, NULL)) * 100) / count(diary_lessons.id), 0), "%")'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getDiaryLessonsTotal(req, res) {
    const dbQuery = new Student()
        .where({ 'students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('student_base_klass', 'student_base_klass.student_tz', 'students.tz',)
            qb.join('diaries')
            qb.innerJoin('diary_lessons', 'diary_lessons.diary_id', 'diaries.id')
            qb.leftJoin('diary_instances', { 'diary_instances.diary_lesson_id': 'diary_lessons.id', 'diary_instances.student_tz': 'students.tz' })
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
        })
        qb.count({
            abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 2, 1, NULL)'),
            late_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 1, 1, NULL)'),
            approved_abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = 3, 1, NULL)'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}
