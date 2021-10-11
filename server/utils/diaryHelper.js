import moment from 'moment';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';
import bookshelf from '../../common-modules/server/config/bookshelf';
import Diary, { DiaryInstance, DiaryLesson } from "../models/diary.model";
import { getAttTypesByUserId } from './queryHelper';

export const processAndValidateData = (user_id, data, dates, lessons, isSubstitute) => {
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
    groupData.dates = Object.fromEntries(diaryData.map(({ lesson_key, lesson_date }) => ([lesson_key, lesson_date])));
    groupData.isSubstitute = Object.fromEntries(diaryData.map(({ lesson_key, is_substitute }) => ([lesson_key, is_substitute])));

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

    for (const lesson of groupData.lessons) {
        if (groupData.dates[lesson]) {
            groupData.dates[lesson] = formatJewishDateHebrew(getJewishDate(new Date(groupData.dates[lesson])));
        }
    }

    const attTypes = await getAttTypesByUserId(groupData.group.user_id);
    const attTypesDict = {};
    attTypes.forEach(item => attTypesDict[item.key] = item.name);
    for (const student of groupData.students) {
        for (const lesson of groupData.lessons) {
            if (student[lesson]) {
                student[lesson] = attTypesDict[student[lesson]];
            }
        }
    }
}