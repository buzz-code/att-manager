/**
 * Add start_date and end_date to student_klasses table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.alterTable('student_klasses', table => {
        table.date('start_date').nullable();
        table.date('end_date').nullable();
    });
};

/**
 * Remove start_date and end_date from student_klasses table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.alterTable('student_klasses', table => {
        table.dropColumn('start_date');
        table.dropColumn('end_date');
    });
};
