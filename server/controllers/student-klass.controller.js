import HttpStatus from 'http-status-codes';
import moment from 'moment';
import StudentKlass from '../models/student-klass.model';
import Student from '../models/student.model';
import Klass from '../models/klass.model';
import genericController, { applyFilters, fetchPage } from '../../common-modules/server/controllers/generic.controller';
import { getListFromTable } from '../../common-modules/server/utils/common';
import bookshelf from '../../common-modules/server/config/bookshelf';
import { defaultYear } from '../utils/listHelper';
import { KLASS_TYPE_BASE, KLASS_TYPE_MAASIT, KLASS_TYPE_SPECIALITY } from '../utils/klassHelper';
import { applyNullSafeDateLiteralFilter } from '../utils/studentKlassDateFilters';

export const { findById, store, update, destroy, uploadMultiple } = genericController(StudentKlass);

/**
 * Extract the `active_at` filter out of the filters object, returning its value and the remaining filters.
 * It's synthetic (not a real column) since it expands into a NULL-safe range check across two columns
 * (start_date/end_date), which the generic single-field applyFilters can't express.
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
    const { activeAt, filtersString } = getActiveAtFilter(req.query.filters);
    const dbQuery = new StudentKlass()
        .where({ 'student_klasses.user_id': req.currentUser.id })
        .query(qb => {
            qb.leftJoin('students', 'students.tz', 'student_klasses.student_tz')
            qb.leftJoin('klasses', 'klasses.key', 'student_klasses.klass_id')
            qb.select('student_klasses.*')
            if (activeAt) {
                applyNullSafeDateLiteralFilter(qb, 'student_klasses.start_date', '<=', activeAt);
                applyNullSafeDateLiteralFilter(qb, 'student_klasses.end_date', '>=', activeAt);
            }
        });
    applyFilters(dbQuery, filtersString);
    fetchPage({ dbQuery }, req.query, res);
}

/**
 * Close the current student_klass assignment and open a new one with a different klass,
 * in a single atomic action - e.g. a student moving from one klass to another mid-year.
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function switchKlass(req, res) {
    const { id, newKlassId, switchDate } = req.body;
    if (!id || !newKlassId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            error: 'יש לבחור שיוך קיים וכיתה חדשה.',
        });
    }
    const effectiveDate = moment(switchDate || undefined).format('YYYY-MM-DD');

    try {
        await bookshelf.transaction(async trx => {
            const current = await new StudentKlass()
                .where({ id, user_id: req.currentUser.id })
                .fetch({ require: true, transacting: trx });

            const previousEndDate = moment(effectiveDate).subtract(1, 'day').format('YYYY-MM-DD');
            const currentStartDate = current.get('start_date');
            if (currentStartDate && moment(previousEndDate).isBefore(moment(currentStartDate), 'day')) {
                throw new Error('תאריך המעבר חייב להיות אחרי תאריך תחילת השיוך הקיים.');
            }

            await current.save({ end_date: previousEndDate }, { patch: true, transacting: trx });

            await new StudentKlass({
                user_id: req.currentUser.id,
                student_tz: current.get('student_tz'),
                klass_id: newKlassId,
                year: current.get('year'),
                start_date: effectiveDate,
                end_date: null,
            }).save(null, { transacting: trx });
        });
    } catch (e) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: e.message,
        });
    }

    res.json({
        error: null,
        data: { message: 'הכיתה הוחלפה בהצלחה.' }
    });
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
                applyNullSafeDateLiteralFilter(qb, 'student_klasses.start_date', '<=', activeAt);
                applyNullSafeDateLiteralFilter(qb, 'student_klasses.end_date', '>=', activeAt);
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
