/**
 * Drop students marked in lesson_excluded_students as not studying the group's lesson in that year.
 *
 * @param {object} qb query builder
 * @param {string} userIdColumn e.g. 'groups.user_id'
 * @param {string} studentTzColumn e.g. 'student_klasses.student_tz'
 * @param {string} lessonIdColumn e.g. 'groups.lesson_id'
 * @param {string} yearColumn e.g. 'groups.year'
 */
export function applyNotExcludedFromLessonFilter(qb, userIdColumn, studentTzColumn, lessonIdColumn, yearColumn) {
    qb.whereRaw(
        'NOT EXISTS (SELECT 1 FROM lesson_excluded_students les WHERE les.user_id = ?? AND les.student_tz = ?? AND les.lesson_id = ?? AND les.year = ??)',
        [userIdColumn, studentTzColumn, lessonIdColumn, yearColumn]
    );
}
