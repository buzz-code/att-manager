import StudentKlass from '../models/student-klass.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { defaultYear } from '../utils/listHelper';
import { KLASS_TYPE_BASE, KLASS_TYPE_MAASIT, KLASS_TYPE_SPECIALITY } from '../utils/klassHelper';

export const { findById, store, update, destroy, uploadMultiple } = genericController(StudentKlass);

const DATE_RANGE_FIELDS = ['student_klasses.start_date', 'student_klasses.end_date'];
const DATE_FILTER_OPERATORS = {
    'date-after': '>=',
    'date-before': '<=',
};
const COLUMN_REF_REGEXP = /^[a-zA-Z_][\w]*\.[a-zA-Z_][\w]*$/;

/**
 * Apply a NULL-safe date comparison, so rows with a blank date column stay visible.
 * `value` can be a literal date value, or a column reference (e.g. 'diary_lessons.lesson_date').
 *
 * @param {object} qb query builder
 * @param {string} column
 * @param {string} operator one of '>=', '<='
 * @param {string} value
 */
export function applyNullSafeDateFilter(qb, column, operator, value) {
    if (COLUMN_REF_REGEXP.test(value)) {
        qb.whereRaw(`(?? IS NULL OR ?? ${operator} ??)`, [column, column, value]);
    } else {
        qb.whereRaw(`(?? IS NULL OR ?? ${operator} ?)`, [column, column, value]);
    }
}

/**
 * Intercept the student_klasses start_date/end_date range filters and apply them in a NULL-safe way,
 * returning the remaining filters (as a JSON string) to be handled by applyFilters.
 *
 * @param {object} dbQuery
 * @param {string} filtersString
 * @returns {string}
 */
function applyStudentKlassesDateRangeFilters(dbQuery, filtersString) {
    if (!filtersString) {
        return filtersString;
    }
    const filtersObj = JSON.parse(filtersString);
    const remainingFilters = {};
    Object.entries(filtersObj).forEach(([key, filter]) => {
        const sqlOperator = DATE_FILTER_OPERATORS[filter.operator];
        if (DATE_RANGE_FIELDS.includes(filter.field) && sqlOperator && filter.value) {
            dbQuery.query(qb => applyNullSafeDateFilter(qb, filter.field, sqlOperator, filter.value));
        } else {
            remainingFilters[key] = filter;
        }
    });
    return JSON.stringify(remainingFilters);
}

/**
 * Extract the `active_at` filter out of the filters object, returning its value and the remaining filters.
 *
 * @param {string} filtersString
 * @returns {{ activeAt: string|null, filtersString: string }}
 */
export function getActiveAtFilter(filtersString) {
    if (!filtersString) {
        return { activeAt: null, filtersString };
    }
    const filtersObj = JSON.parse(filtersString);
    let activeAt = null;
    const remainingFilters = {};
    Object.entries(filtersObj).forEach(([key, filter]) => {
        if (filter.field === 'active_at' && filter.value) {
            activeAt = filter.value;
        } else {
            remainingFilters[key] = filter;
        }
    });
    return { activeAt, filtersString: JSON.stringify(remainingFilters) };
}

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
    const remainingFilters = applyStudentKlassesDateRangeFilters(dbQuery, req.query.filters);
    applyFilters(dbQuery, remainingFilters);
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
    const { activeAt, filtersString } = getActiveAtFilter(req.query.filters);
    const dbQuery = new StudentKlass()
        .where({ 'klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', 'students.tz', 'student_klasses.student_tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
            if (activeAt) {
                applyNullSafeDateFilter(qb, 'student_klasses.start_date', '<=', activeAt);
                applyNullSafeDateFilter(qb, 'student_klasses.end_date', '>=', activeAt);
            }
        });
    applyFilters(dbQuery, filtersString);
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
