/**
 * Students of a klass who don't study one of its lessons (course), for a whole year.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('lesson_excluded_students', table => {
        table.increments('id').primary().unsigned();
        table.integer('user_id').notNullable();
        table.string('student_tz').notNullable();
        table.integer('lesson_id').notNullable();
        table.integer('year').notNullable();
        table.index(['user_id', 'lesson_id', 'year', 'student_tz'], 'lesson_excluded_students_lookup');
    });
};

/**
 * Drop lesson_excluded_students table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('lesson_excluded_students');
};
