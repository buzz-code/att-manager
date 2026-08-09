import moment from 'moment';

/**
 * Apply a NULL-safe date comparison against another joined table's column, so rows with a blank
 * date column stay visible (e.g. keep a student_klasses row whose start_date/end_date is unset,
 * when checking whether it was active on a given diary_lessons.lesson_date).
 *
 * `referenceColumn` is always a column identifier, never a literal value - see applyNullSafeDateLiteralFilter
 * for comparing against a literal value instead.
 *
 * @param {object} qb query builder
 * @param {string} column
 * @param {'<='|'>='} operator
 * @param {string} referenceColumn e.g. 'diary_lessons.lesson_date'
 */
export function applyNullSafeDateColumnFilter(qb, column, operator, referenceColumn) {
    qb.whereRaw(`(?? IS NULL OR ?? ${operator} ??)`, [column, column, referenceColumn]);
}

/**
 * Apply a NULL-safe date comparison against a literal date value.
 *
 * @param {object} qb query builder
 * @param {string} column
 * @param {'<='|'>='} operator
 * @param {string} value literal date value, e.g. '2026-07-26'
 */
export function applyNullSafeDateLiteralFilter(qb, column, operator, value) {
    qb.whereRaw(`(?? IS NULL OR ?? ${operator} ?)`, [column, column, moment(value).format('YYYY-MM-DD')]);
}
