import bookshelf from '../../common-modules/server/config/bookshelf';
import Student from './student.model';
import Teacher from './teacher.model';
import User from './user.model';

const TABLE_NAME = 'student_klasses';

/**
 * StudentKlass model.
 */
class StudentKlass extends bookshelf.Model {

    /**
     * Get table name.
     */
    get tableName() {
        return TABLE_NAME;
    }

    // get hasTimestamps() {
    //     return true;
    // }

    user() {
        return this.belongsTo(User);
    }

    student() {
        return this.belongsTo(Student);
    }

    group() {
        return this.belongsTo(Teacher);
    }
}

export default StudentKlass;