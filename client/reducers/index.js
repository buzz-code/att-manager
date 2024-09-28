import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';

// Import custom components
import authReducer from '../../common-modules/client/reducers/authReducer';
import crudReducer from '../../common-modules/client/reducers/crudReducer';
import {
  TEACHERS,
  STUDENTS,
  LESSONS,
  KLASSS,
  STUDENT_KLASSES,
  GROUPS,
  DIARIES,
  ATT_TYPES,
  KLASS_TYPES,
  ATT_REPORTS,
  STUDENT_KLASSES_KLASS_TYPE,
  STUDENT_ATT_REPORT,
  PIVOT_REPORTS,
  DIARY_INSTANCES_REPORTS,
  DIARY_LESSONS_REPORTS,
  DIARY_LESSONS_TOTAL_REPORTS,
  REPORT_EDIT,
  // STUDENT_REPORTS,
  // TEACHER_REPORTS,
  // ORGANIATION_REPORTS,
  DASHBOARD,
  TEACHER_ATT_REPORTS,
  STUDENT_LAST_ATT,
} from '../constants/entity';

const appReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    form: formReducer, // ← redux-form
    auth: authReducer,
    [TEACHERS]: crudReducer(TEACHERS),
    [STUDENTS]: crudReducer(STUDENTS),
    [LESSONS]: crudReducer(LESSONS),
    [KLASSS]: crudReducer(KLASSS),
    [STUDENT_KLASSES]: crudReducer(STUDENT_KLASSES),
    [GROUPS]: crudReducer(GROUPS),
    [DIARIES]: crudReducer(DIARIES),
    [ATT_TYPES]: crudReducer(ATT_TYPES),
    [KLASS_TYPES]: crudReducer(KLASS_TYPES),
    [ATT_REPORTS]: crudReducer(ATT_REPORTS),
    [STUDENT_KLASSES_KLASS_TYPE]: crudReducer(STUDENT_KLASSES_KLASS_TYPE),
    [STUDENT_ATT_REPORT]: crudReducer(STUDENT_ATT_REPORT),
    [PIVOT_REPORTS]: crudReducer(PIVOT_REPORTS),
    [DIARY_INSTANCES_REPORTS]: crudReducer(DIARY_INSTANCES_REPORTS),
    [DIARY_LESSONS_REPORTS]: crudReducer(DIARY_LESSONS_REPORTS),
    [DIARY_LESSONS_TOTAL_REPORTS]: crudReducer(DIARY_LESSONS_TOTAL_REPORTS),
    [REPORT_EDIT]: crudReducer(REPORT_EDIT),
    // [STUDENT_REPORTS]: crudReducer(STUDENT_REPORTS),
    // [TEACHER_REPORTS]: crudReducer(TEACHER_REPORTS),
    // [ORGANIATION_REPORTS]: crudReducer(ORGANIATION_REPORTS),
    [DASHBOARD]: crudReducer(DASHBOARD),
    [TEACHER_ATT_REPORTS]: crudReducer(TEACHER_ATT_REPORTS),
    [STUDENT_LAST_ATT]: crudReducer(STUDENT_LAST_ATT),
  });

const rootReducer = (state, action) => {
  if (action === 'LOG_OUT_SUCCESS') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
