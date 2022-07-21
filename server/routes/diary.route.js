import * as diaryCtrl from '../controllers/diary.controller';
import genericRoute from '../../common-modules/server/routes/generic.route';
import { exportPdf } from '../../common-modules/server/utils/template';

const router = genericRoute(diaryCtrl, router => {
    router.route('/get-edit-data')
        .get(async (req, res) => {
            await diaryCtrl.getEditData(req, res);
        });

    router.route('/get-diary-data')
        .post(async (req, res) => {
            await diaryCtrl.getDiaryData(req, res);
        });

    router.route('/save-diary-data')
        .post(async (req, res) => {
            await diaryCtrl.saveDiaryData(req, res);
        });

    router.route('/print-one-diary')
        .post(async (req, res) => {
            await diaryCtrl.printOneDiary(req, res);
        });

    router.route('/print-all-diaries')
        .post(async (req, res) => {
            await diaryCtrl.printAllDiaries(req, res);
        });

    router.route('/report-by-dates')
        .get((req, res) => {
            diaryCtrl.reportByDates(req, res);
        });

    router.route('/get-pivot-data')
        .get(async (req, res) => {
            await diaryCtrl.getPivotData(req, res);
        });

    router.route('/get-all-diary-instances')
        .get(async (req, res) => {
            await diaryCtrl.getAllDiaryInstances(req, res);
        });

    router.route('/get-all-diary-lessons')
        .get(async (req, res) => {
            await diaryCtrl.getDiaryLessons(req, res);
        });

    router.route('/get-all-diary-lessons-total')
        .get(async (req, res) => {
            await diaryCtrl.getDiaryLessonsTotal(req, res);
        });

    router.route('/get-teacher-att-report')
        .get(async (req, res) => {
            await diaryCtrl.getTeacherAttReport(req, res);
        });

    router.route('/:reportId/export-pdf')
        .post((req, res) => {
            exportPdf(req, res);
        });
});

export default router;