import AttReport from '../models/att-report.model';
import Student from '../models/student.model';
import StudentKlass from '../models/student-klass.model';
import Teacher from '../models/teacher.model';

import { getCountFromTable } from '../../common-modules/server/utils/query';

/**
 * Get stats
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getStats(req, res) {
    const [reports, students5782, students5783, students5784, teachers] = await Promise.all([
        getCountFromTable(AttReport, req.currentUser.id),
        getCountFromTable(StudentKlass, req.currentUser.id, { year: 5782 }, 'student_tz'),
        getCountFromTable(StudentKlass, req.currentUser.id, { year: 5783 }, 'student_tz'),
        getCountFromTable(StudentKlass, req.currentUser.id, { year: 5784 }, 'student_tz'),
        getCountFromTable(Teacher, req.currentUser.id),
    ]);
    res.json({
        error: null,
        data: { reports, students5782, students5783, students5784, teachers }
    });
}
