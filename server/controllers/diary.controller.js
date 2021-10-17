import HttpStatus from 'http-status-codes';
import Diary, { DiaryInstance } from '../models/diary.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getDiaryDataByGroupId, getAllAttTypesByUserId, getDiaryDataByDiaryId } from '../utils/queryHelper';
import { fillDiaryData, processAndValidateData, saveData } from '../utils/diaryHelper';
import { getDiaryStreamByDiaryId } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';

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
            qb.leftJoin('students', 'students.tz', 'diary_instances.student_tz')
            qb.leftJoin('diary_lessons', 'diary_lessons.id', 'diary_instances.diary_lesson_id')
            qb.leftJoin('diaries', 'diaries.id', 'diary_lessons.diary_id')
            qb.leftJoin('groups', 'groups.id', 'diaries.group_id')
            qb.leftJoin('klasses', 'klasses.key', 'groups.klass_id')
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
