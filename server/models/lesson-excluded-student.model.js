import bookshelf from '../../common-modules/server/config/bookshelf';
import User from './user.model';

const TABLE_NAME = 'lesson_excluded_students';

/**
 * LessonExcludedStudent model: a student who doesn't study a lesson of her klass.
 */
class LessonExcludedStudent extends bookshelf.Model {

    /**
     * Get table name.
     */
    get tableName() {
        return TABLE_NAME;
    }

    user() {
        return this.belongsTo(User);
    }
}

export default LessonExcludedStudent;
