import * as diaryCtrl from '../controllers/diary.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(diaryCtrl, router => {
    // router.route('/get-edit-data')
    //     .get((req, res) => {
    //         diaryCtrl.getEditData(req, res);
    //     });
});

export default router;