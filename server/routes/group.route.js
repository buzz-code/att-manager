import * as groupCtrl from '../controllers/group.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';

const router = genericRoute(groupCtrl, router => {
    router.route('/get-edit-data')
        .get((req, res) => {
            groupCtrl.getEditData(req, res);
        });

    router.route('/print-one-diary')
        .post(async (req, res) => {
            await groupCtrl.printOneDiary(req, res);
        });

    router.route('/print-all-diaries')
        .post(async (req, res) => {
            await groupCtrl.printAllDiaries(req, res);
        });

    router.route('/print-one-grade')
        .post(async (req, res) => {
            await groupCtrl.printOneGrade(req, res);
        });

    router.route('/print-all-grades')
        .post(async (req, res) => {
            await groupCtrl.printAllGrades(req, res);
        });

    router.route('/excel-one-grade')
        .post(async (req, res) => {
            await groupCtrl.excelOneGrade(req, res);
        });

});

export default router;