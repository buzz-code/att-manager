import * as lessonExcludedStudentCtrl from '../controllers/lesson-excluded-student.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(lessonExcludedStudentCtrl, router => {
    router.route('/get-edit-data')
        .get((req, res) => {
            lessonExcludedStudentCtrl.getEditData(req, res);
        });
});

export default router;
