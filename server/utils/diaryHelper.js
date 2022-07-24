import moment from 'moment';
import bookshelf from '../../common-modules/server/config/bookshelf';
import Diary, { DiaryInstance, DiaryLesson } from "../models/diary.model";
import { getAttTypesByUserId } from './queryHelper';
import { formatJewishDates, getDatesFromDiaryData, getLessonsByLessonCount, getSubtituteFromDiaryData } from '../../common-modules/server/utils/diary';

export const processAndValidateData = (user_id, group, data, dates, isSubstitute) => {
    const lessons = getLessonsByLessonCount(group.lesson_count);
    const diaryLessons = {};

    for (const student of data) {
        for (const lesson of lessons) {
            if (student[lesson] && !dates[lesson]) {
                throw new Error('חובה לבחור תאריך לשיעור');
            }
            if (!dates[lesson]) {
                continue;
            }
            if (!diaryLessons[lesson]) {
                diaryLessons[lesson] = {
                    user_id,
                    lesson_key: lesson,
                    lesson_date: moment(dates[lesson]).format('YYYY-MM-DD'),
                    is_substitute: isSubstitute[lesson],
                    students: []
                }
            }
            if (student[lesson]) {
                diaryLessons[lesson].students.push({
                    user_id,
                    student_tz: student.tz,
                    student_att_key: student[lesson] || null,
                })
            }
        }
    }

    return Object.values(diaryLessons);
}

async function deleteAllDiaryLessonsAndInstances(diary_id) {
    const diaryLessons = await new DiaryLesson()
        .where({ diary_id })
        .query({ select: ['id'] })
        .fetchAll()
        .then(res => res.toJSON())
        .then(res => res.map(item => item.id));

    await new DiaryLesson().query(qb => qb.where('id', 'in', diaryLessons)).destroy({ require: false });
    await new DiaryInstance().query(qb => qb.where('diary_lesson_id', 'in', diaryLessons)).destroy({ require: false });
}

export const saveData = async (user_id, group_id, diary_id, dataToSave) => {
    if (diary_id) {
        await deleteAllDiaryLessonsAndInstances(diary_id);
    }
    else {
        ({ id: diary_id } = await new Diary({ user_id, group_id }).save());
    }

    const instances = []
    for (const item of dataToSave) {
        const students = item.students;
        delete item.students;
        const { id: diary_lesson_id } = await new DiaryLesson({ user_id, diary_id, ...item }).save();
        for (const student of students) {
            instances.push({ user_id, diary_lesson_id, ...student });
        }
    }

    await bookshelf.knex(new DiaryInstance().tableName).insert(instances);
}

export function fillDiaryData(diaryData, groupData) {
    groupData.dates = getDatesFromDiaryData(diaryData);
    groupData.isSubstitute = getSubtituteFromDiaryData(diaryData);

    const studentDict = {};
    groupData.students.forEach(student => studentDict[student.tz] = student);
    for (const diaryInstance of diaryData) {
        if (studentDict[diaryInstance.student_tz]) {
            studentDict[diaryInstance.student_tz][diaryInstance.lesson_key] = diaryInstance.student_att_key || '';
        }
    }
}

export async function fillDiaryDataForPrint(diaryData, groupData) {
    fillDiaryData(diaryData, groupData);

    groupData.isFilled = true;

    formatJewishDates(groupData);

    const attTypes = await getAttTypesByUserId(groupData.group.user_id);
    const attTypesDict = {};
    attTypes.forEach(item => attTypesDict[item.key] = item.name);
    for (const student of groupData.students) {
        for (const lesson in student) {
            student[lesson] = attTypesDict[student[lesson]] || student[lesson];
        }
    }
}