import Klass from "../models/klass.model";
import Teacher from "../models/teacher.model";
import AttType from "../models/att-type.model";
import User from "../models/user.model";
import StudentKlass from "../models/student-klass.model";
import Lesson from "../models/lesson.model";
import Group from "../models/group.model";
import Diary from "../models/diary.model";
import { getLessonsByLessonCount } from "../../common-modules/server/utils/diary";

export function getUserByPhone(phone_number) {
    return new User().where({ phone_number })
        .fetch()
        .then(res => res.toJSON());
}

export function getTeacherByUserIdAndPhone(user_id, phone) {
    return new Teacher().where({ user_id, phone })
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getKlassByUserIdAndKlassId(user_id, key) {
    return new Klass().where({ user_id, key })
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getLessonByUserIdAndLessonId(user_id, key) {
    return new Lesson().where({ user_id, key })
        .fetch({ require: false })
        .then(res => res ? res.toJSON() : null);
}

export function getStudentsByUserIdAndKlassId(user_id, klass_id) {
    return new StudentKlass().where({ user_id, klass_id })
        .fetchAll({ withRelated: [{ student: function (query) { query.orderBy('name'); } }] })
        .then(res => res.toJSON())
        .then(res => res.map(item => item.student));
}

export function getAttTypesForTeacherByUserId(user_id) {
    return new AttType().where({ user_id, is_active: true, is_for_teacher: true })
        .fetchAll()
        .then(res => res.toJSON());
}

export function getAttTypesByUserId(user_id) {
    return new AttType().where({ user_id })
        .fetchAll()
        .then(res => res.toJSON());
}

export function getAllAttTypesByUserId(user_id) {
    return new AttType().where({ user_id })
        .fetchAll()
        .then(res => res.toJSON());
}

export async function getDiaryDataByGroupId(group_id) {
    const group = await new Group().where({ id: group_id })
        .fetch({ withRelated: ['klass', 'teacher', 'lesson'] })
        .then(res => res.toJSON());
    const students = await getStudentsByUserIdAndKlassId(group.user_id, group.klass_id);
    const lessons = getLessonsByLessonCount(group.lesson_count);

    return {
        group,
        students: students.sort((a, b) => a.name.localeCompare(b.name)),
        lessons,
        isFilled: false,
        dates: null,
        isSubstitute: null,
    };
}

export function getDiaryDataByDiaryId(diary_id) {
    return new Diary().where({ 'diaries.id': diary_id })
        .query(qb => {
            qb.leftJoin('diary_lessons', 'diary_lessons.diary_id', 'diaries.id')
            qb.leftJoin('diary_instances', 'diary_instances.diary_lesson_id', 'diary_lessons.id')
            qb.select('lesson_key', 'lesson_date', 'student_tz', 'student_att_key', 'is_substitute')
        })
        .fetchAll()
        .then(res => res.toJSON());
}
