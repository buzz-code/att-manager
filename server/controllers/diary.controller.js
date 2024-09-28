import HttpStatus from 'http-status-codes';
import Diary, { DiaryInstance } from '../models/diary.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import Teacher from '../models/teacher.model';
import Lesson from '../models/lesson.model';
import AttType from '../models/att-type.model';
import Group from '../models/group.model';
import genericController, { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getDiaryDataByGroupId, getAllAttTypesByUserId, getDiaryDataByDiaryId, getGroupById, updateDiaryInstancesAttKey } from '../utils/queryHelper';
import { STUDENT_ABS_KEY, STUDENT_APPR_ABS_KEY, STUDENT_LATE_KEY, fillDiaryData, processAndValidateData, saveData } from '../utils/diaryHelper';
import { getDiaryMergedPdfStreamByDiaries, getDiaryStreamByDiaryId } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { defaultYear } from '../utils/listHelper';
import StudentByYear from '../models/student-by-year.model';
import { KLASS_TYPE_BASE, KLASS_TYPE_MAASIT, KLASS_TYPE_SPECIALITY } from '../utils/klassHelper';

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
            qb.select({
                group_name: bookshelf.knex.raw('CONCAT_WS(" ", klasses.name, teachers.name, lessons.name)'),
                year: 'groups.year'
            })
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
    const { body: { groupId, diaryId, data, dates, isSubstitute } } = req;

    try {
        const group = await getGroupById(groupId);
        const dataToSave = processAndValidateData(req.currentUser.id, group, data, dates, isSubstitute);
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
            qb.leftJoin('student_base_klass', { 'student_base_klass.student_tz': 'students.tz', 'student_base_klass.year': 'groups.year' })
            // qb.where('diary_instances.student_att_key', '=', STUDENT_ABS_KEY)
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id', 'student_base_klass.year', 'student_base_klass.klass_name'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id', 'student_base_klass.year', 'student_base_klass.klass_name')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            year: 'student_base_klass.year',
            absences_1_late: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_BASE + ' AND diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, 0))'),
            absences_1_abs: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_BASE + ' AND diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, 0))'),
            absences_1_appr: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_BASE + ' AND diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, 0))'),
            absences_2_late: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_SPECIALITY + ' AND diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, 0))'),
            absences_2_abs: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_SPECIALITY + ' AND diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, 0))'),
            absences_2_appr: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_SPECIALITY + ' AND diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, 0))'),
            absences_3_late: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_MAASIT + ' AND diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, 0))'),
            absences_3_abs: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_MAASIT + ' AND diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, 0))'),
            absences_3_appr: bookshelf.knex.raw('SUM(IF(klasses.klass_type_id = ' + KLASS_TYPE_MAASIT + ' AND diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, 0))'),
            // absences_null: bookshelf.knex.raw('COUNT(if(klasses.klass_type_id is null, diary_instances.student_att_key, null))'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getEditData(req, res) {
    const [students, klasses, teachers, lessons, attTypes] = await Promise.all([
        getListFromTable(StudentByYear, req.currentUser.id, 'tz', { year: req.query.year ?? defaultYear }),
        getListFromTable(Klass, req.currentUser.id, 'key', { year: req.query.year ?? defaultYear }),
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
            if (filter.field == 'student_klasses.year') {
                studentFilters.push(filter);
                studentFilters.push({ ...filter, field: 'student_base_klass.year' });
                reportFilters.push({ ...filter, field: 'groups.year' });
            } else if (filter.field.startsWith('student')) {
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
            qb.leftJoin('student_base_klass', 'student_base_klass.student_tz', 'students.tz',)
            qb.groupBy('students.id', 'student_base_klass.year')
            qb.distinct('students.tz', 'students.name')
            qb.select({
                student_base_klass: 'student_base_klass.klass_name',
                year: 'student_base_klass.year',
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
        if (item.student_att_key === STUDENT_ABS_KEY) {
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

function getDiaryInstancesQuery(user_id, filters) {
    const dbQuery = new DiaryInstance()
        .where({ 'diary_instances.user_id': user_id })
        .query(qb => {
            qb.innerJoin('students', 'students.tz', 'diary_instances.student_tz')
            qb.innerJoin('diary_lessons', 'diary_lessons.id', 'diary_instances.diary_lesson_id')
            qb.innerJoin('diaries', 'diaries.id', 'diary_lessons.diary_id')
            qb.innerJoin('groups', 'groups.id', 'diaries.group_id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.innerJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.innerJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.innerJoin('att_types', 'att_types.key', 'diary_instances.student_att_key')
            qb.leftJoin('student_base_klass', { 'student_base_klass.student_tz': 'students.tz', 'student_base_klass.year': 'groups.year' })
            qb.whereNotNull('diary_instances.student_att_key')
        });
    applyFilters(dbQuery, filters);
    return dbQuery;
}
export async function getAllDiaryInstances(req, res) {
    const dbQuery = getDiaryInstancesQuery(req.currentUser.id, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['diary_instances.id', 'att_types.name'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('diary_instances.id', 'att_types.name')
        qb.select({
            id: 'diary_instances.id',
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            year: 'student_base_klass.year',
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
        qb.groupBy('students.id', 'groups.id', 'student_base_klass.klass_name', 'student_base_klass.year')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            year: 'student_base_klass.year',
            teacher_name: 'teachers.name',
            klass_name: 'klasses.name',
            lesson_name: 'lessons.name',
        })
        qb.count({
            total_lessons: 'diary_lessons.id',
            abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, NULL)'),
            late_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, NULL)'),
            approved_abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, NULL)'),
        })
        qb.select({
            abs_count_num: bookshelf.knex.raw('(count(IF(diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, NULL)) * 100) / count(diary_lessons.id)'),
            abs_percents: bookshelf.knex.raw('CONCAT(ROUND((count(IF(diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, NULL)) * 100) / count(diary_lessons.id), 0), "%")'),
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
        .countDistinct({ count: ['students.id', 'student_base_klass.year'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id', 'student_base_klass.year')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            year: 'student_base_klass.year',
        })
        qb.count({
            abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, NULL)'),
            late_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, NULL)'),
            approved_abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, NULL)'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getTeacherAttReport(req, res) {
    const dbQuery = new Group()
        .where({ 'groups.user_id': req.currentUser.id })
        .query(qb => {
            qb.innerJoin('diaries', 'diaries.group_id', 'groups.id')
            qb.innerJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.innerJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.innerJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.innerJoin('diary_lessons', 'diary_lessons.diary_id', 'diaries.id')
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['groups.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('groups.id')
        qb.select({
            teacher_name: 'teachers.name',
            klass_name: 'klasses.name',
            lesson_name: 'lessons.name',
            year: 'groups.year',
        })
        qb.count({
            total_lessons: 'diary_lessons.id',
            teacher_lessons_count: bookshelf.knex.raw('IF(diary_lessons.is_substitute is null, 1, NULL)'),
            teacher_lessons_abs_count: bookshelf.knex.raw('IF(diary_lessons.is_substitute = 1, 1, NULL)'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function getStudentLastAtt(req, res) {
    // changes proposal:
    // 1. show all lessons ,even when student missed it - remove condition, and change max calc to include the condition
    // 2. do not show approve abs - add this to the condition
    // 3. hebrew date - done on client side
    // 4. performance - need to investigate and add indexes
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
            qb.where('diary_instances.student_att_key', '!=', STUDENT_ABS_KEY)
        });
    applyFilters(dbQuery, req.query.filters);
    const countQuery = dbQuery.clone().query()
        .countDistinct({ count: ['students.id', 'groups.id'] })
        .then(res => res[0].count);
    dbQuery.query(qb => {
        qb.groupBy('students.id', 'groups.id', 'student_base_klass.klass_name', 'student_base_klass.year')
        qb.select({
            student_tz: 'students.tz',
            student_name: 'students.name',
            student_base_klass: 'student_base_klass.klass_name',
            year: 'student_base_klass.year',
            teacher_name: 'teachers.name',
            klass_name: 'klasses.name',
            lesson_name: 'lessons.name',
        })
        qb.count({
            total_lessons: 'diary_lessons.id',
            abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_ABS_KEY + ', 1, NULL)'),
            late_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_LATE_KEY + ', 1, NULL)'),
            approved_abs_count: bookshelf.knex.raw('IF(diary_instances.student_att_key = ' + STUDENT_APPR_ABS_KEY + ', 1, NULL)'),
        })
        qb.max({
            last_att: 'diary_lessons.lesson_date'
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}

export async function approveSomeInstances(req, res) {
    const { body: { ids } } = req;

    try {
        await updateDiaryInstancesAttKey(ids, STUDENT_APPR_ABS_KEY);
    } catch (e) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: e.message,
        });
    }

    res.json({
        error: null,
        data: { message: 'הנתונים נשמרו בהצלחה.' }
    });
}

export async function approveAllInstances(req, res) {
    const { body: { filters } } = req;
    const dbQuery = getDiaryInstancesQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 200 });

    if (total > 200) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן לאשר יותר מ200 חיסורים בבת אחת'
        });
    }
    const ids = data.map(item => item.id);

    try {
        await updateDiaryInstancesAttKey(ids, STUDENT_APPR_ABS_KEY);
    } catch (e) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: e.message,
        });
    }

    res.json({
        error: null,
        data: { message: 'הנתונים נשמרו בהצלחה.' }
    });
}
