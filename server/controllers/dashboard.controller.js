import AttReport from '../models/att-report.model';
import Student from '../models/student.model';
import StudentKlass from '../models/student-klass.model';
import Teacher from '../models/teacher.model';

import { getCountFromTable } from '../../common-modules/server/utils/query';
import { defaultYear } from '../utils/listHelper';

/**
 * Get stats
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getStats(req, res) {
    const [reports, students, teachers] = await Promise.all([
        getCountFromTable(AttReport, req.currentUser.id, { year: req.query.year ?? defaultYear }),
        getCountFromTable(StudentKlass, req.currentUser.id, { year: req.query.year ?? defaultYear }, 'student_tz'),
        getCountFromTable(Teacher, req.currentUser.id),
    ]);
    res.json({
        error: null,
        data: { reports, students, teachers }
    });
}
