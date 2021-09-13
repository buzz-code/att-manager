import * as diaryCtrl from '../controllers/diary.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(diaryCtrl, router => {
    router.route('/get-diary-data')
        .post(async (req, res) => {
            await diaryCtrl.getDiaryData(req, res);
        });
});

export default router;