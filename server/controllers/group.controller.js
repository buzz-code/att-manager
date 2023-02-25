import HttpStatus from 'http-status-codes';
import Group from '../models/group.model';
import Klass from '../models/klass.model';
import Teacher from '../models/teacher.model';
import Lesson from '../models/lesson.model';
import genericController, { applyFilters, fetchPage, fetchPagePromise } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { getDiaryStreamByGroupId, getDiaryMergedPdfStreamByGroups, getGradeStreamByGroupId, getGradeMergedPdfStreamByGroups } from '../utils/printHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';
import { getGradeExcelStreamByGroupId } from '../utils/excelHelper';

export const { findById, store, update, destroy, uploadMultiple } = genericController(Group);

function getFindAllQuery(user_id, filters) {
    const dbQuery = new Group()
        .where({ 'groups.user_id': user_id })
        .query(qb => {
            qb.leftJoin('klasses', 'klasses.key', 'groups.klass_id')
            qb.leftJoin('teachers', 'teachers.tz', 'groups.teacher_id')
            qb.leftJoin('lessons', 'lessons.key', 'groups.lesson_id')
            qb.select('groups.*')
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
 * Get edit data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getEditData(req, res) {
    const [klasses, teachers, lessons] = await Promise.all([
        getListFromTable(Klass, req.currentUser.id, 'key'),
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { klasses, teachers, lessons }
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
    const { body: { id, diaryDate } } = req;
    const { fileStream, filename } = await getDiaryStreamByGroupId(id, diaryDate);
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
    const { body: { filters, diaryDate } } = req;
    const dbQuery = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 100 });
    if (total > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן להדפיס יותר מ100 יומנים במקביל'
        });
    }
    const { fileStream, filename } = await getDiaryMergedPdfStreamByGroups(data, diaryDate);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

export async function printOneGrade(req, res) {
    const { body: { id, half } } = req;
    const { fileStream, filename } = await getGradeStreamByGroupId(id, half);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

export async function printAllGrades(req, res) {
    const { body: { filters, half } } = req;
    const dbQuery = getFindAllQuery(req.currentUser.id, JSON.stringify(filters));
    const { data, total } = await fetchPagePromise({ dbQuery }, { page: 0, pageSize: 100 });
    if (total > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן להדפיס יותר מ100 ציונים במקביל'
        });
    }
    const { fileStream, filename } = await getGradeMergedPdfStreamByGroups(data, half);
    downloadFileFromStream(fileStream, filename, 'pdf', res);
}

export async function excelOneGrade(req, res) {
    const { body: { id, half } } = req;
    const { fileStream, filename } = await getGradeExcelStreamByGroupId(id, half);
    downloadFileFromStream(fileStream, filename, 'xlsx', res);
}
