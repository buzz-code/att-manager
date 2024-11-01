import StudentKlass from '../models/student-klass.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { defaultYear } from '../utils/listHelper';
import { KLASS_TYPE_BASE, KLASS_TYPE_MAASIT, KLASS_TYPE_SPECIALITY } from '../utils/klassHelper';

export const { findById, store, update, destroy, uploadMultiple } = genericController(StudentKlass);

/**
 * Find all the items
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function findAll(req, res) {
    const dbQuery = new StudentKlass()
        .where({ 'student_klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', 'students.tz', 'student_klasses.student_tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
            qb.select('student_klasses.*')
        });
    applyFilters(dbQuery, req.query.filters);
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
    function getStudentByYear(year) {
        return new StudentKlass()
            .where({
                'student_klasses.year': year,
                'student_klasses.user_id': req.currentUser.id,
            })
            .query(qb => {
                qb.leftJoin('students', 'students.tz', 'student_klasses.student_tz');
                qb.groupBy('students.id')
                qb.select({
                    tz: 'students.tz',
                    name: 'students.name',
                })
            })
            .fetchAll()
            .then(result => result.toJSON());
    }

    const [students, studentsByYear, klasses] = await Promise.all([
        getListFromTable(Student, req.currentUser.id, 'tz'),
        getStudentByYear(req.query.year ?? defaultYear),
        getListFromTable(Klass, req.currentUser.id, 'key', { year: req.query.year ?? defaultYear }),
    ]);
    res.json({
        error: null,
        data: { students, studentsByYear, klasses }
    });
}

/**
 * report by klass type
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function reportByKlassType(req, res) {
    const dbQuery = new StudentKlass()
        .where({ 'klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', 'students.tz', 'student_klasses.student_tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
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
            klasses_1: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = ' + KLASS_TYPE_BASE + ', klasses.name, null) SEPARATOR ", ")'),
            klasses_2: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = ' + KLASS_TYPE_SPECIALITY + ', klasses.name, null) SEPARATOR ", ")'),
            klasses_3: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id = ' + KLASS_TYPE_MAASIT + ', klasses.name, null) SEPARATOR ", ")'),
            klasses_null: bookshelf.knex.raw('GROUP_CONCAT(if(klasses.klass_type_id is null, klasses.name, null) SEPARATOR ", ")'),
        })
    });
    fetchPage({ dbQuery, countQuery }, req.query, res);
}
