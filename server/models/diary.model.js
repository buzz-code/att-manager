import bookshelf from '../../common-modules/server/config/bookshelf';
import Group from './group.model';
import User from './user.model';

const TABLE_NAME = 'diaries';

/**
 * Diary model.
 */
class Diary extends bookshelf.Model {

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

    group() {
        return this.belongsTo(Group);
    }
}

export default Diary;