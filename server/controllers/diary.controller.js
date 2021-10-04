import HttpStatus from 'http-status-codes';
import Diary from '../models/diary.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getDiaryDataByGroupId, getAllAttTypesByUserId, getDiaryDataByDiaryId } from '../utils/queryHelper';
import { fillDiaryData, processAndValidateData, saveData } from '../utils/diaryHelper';
import { getDiaryStreamByGroupId } from '../utils/printHelper';
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
    const { body: { groupId, diaryId, data, dates, lessons } } = req;

    try {
        const dataToSave = processAndValidateData(req.currentUser.id, data, dates, lessons);
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
    const { fileStream, filename } = await getDiaryStreamByGroupId(group_id);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}
