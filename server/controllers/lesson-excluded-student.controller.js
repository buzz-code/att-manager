import LessonExcludedStudent from '../models/lesson-excluded-student.model';
import Lesson from '../models/lesson.model';
import StudentByYear from '../models/student-by-year.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { defaultYear } from '../utils/listHelper';

export const { findById, store, update, destroy, uploadMultiple } = genericController(LessonExcludedStudent);

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new LessonExcludedStudent()
        .where({ 'lesson_excluded_students.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', { 'students.tz': 'lesson_excluded_students.student_tz', 'students.user_id': 'lesson_excluded_students.user_id' })
            qb.leftJoin('lessons', { 'lessons.key': 'lesson_excluded_students.lesson_id', 'lessons.user_id': 'lesson_excluded_students.user_id' })
            qb.select('lesson_excluded_students.*')
        });
    applyFilters(dbQuery, req.query.filters);
    fetchPage({ dbQuery }, req.query, res);
}

/**
 * Lists for the edit screen
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getEditData(req, res) {
    const [students, lessons] = await Promise.all([
        getListFromTable(StudentByYear, req.currentUser.id, 'tz', { year: req.query.year ?? defaultYear }),
        getListFromTable(Lesson, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { students, lessons }
    });
}
