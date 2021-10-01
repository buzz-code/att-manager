import HttpStatus from 'http-status-codes';
import Diary from '../models/diary.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { getDiaryDataByGroupId, getAllAttTypesByUserId } from '../utils/queryHelper';
import { processAndValidateData, saveData } from '../utils/diaryHelper';

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
    fetchPage({ dbQuery }, req.query, res);
}

/**
 * Get Diary Data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getDiaryData(req, res) {
    const { body: { groupId } } = req;
    const groupData = await getDiaryDataByGroupId(groupId);
    const attTypes = await getAllAttTypesByUserId(req.currentUser.id);
    res.json({
        error: null,
        data: { groupData, attTypes }
    });
}

export async function saveDiaryData(req, res) {
    const { body: { groupId, data, dates, lessons } } = req;

    try {
        const dataToSave = processAndValidateData(req.currentUser.id, data, dates, lessons);
        await saveData(req.currentUser.id, groupId, dataToSave);
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
