import bookshelf from '../../common-modules/server/config/bookshelf';
import Diary, { DiaryInstance, DiaryLesson } from "../models/diary.model";

export const processAndValidateData = (user_id, data, dates, lessons) => {
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
                    lesson_date: dates[lesson].split('T')[0],
                    students: []
                }
            }
            diaryLessons[lesson].students.push({
                user_id,
                student_tz: student.tz,
                student_att_key: student[lesson]
            })
        }
    }

    return Object.values(diaryLessons);
}

export const saveData = async (user_id, group_id, dataToSave) => {
    const { id: diary_id } = await new Diary({ user_id, group_id }).save();

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
    groupData.dates = Object.fromEntries(diaryData.map(({ lesson_key, lesson_date }) => ([lesson_key, lesson_date])));

    const studentDict = {};
    groupData.students.forEach(student => studentDict[student.tz] = student);
    for (const diaryInstance of diaryData) {
        studentDict[diaryInstance.student_tz][diaryInstance.lesson_key] = diaryInstance.student_att_key || '';
    }
}