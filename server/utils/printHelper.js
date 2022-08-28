import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import temp from 'temp';
import PDFMerger from 'pdf-merger-js';
import { getJewishDate, getHebJewishMonthById, convertToHebrew } from 'jewish-dates-core';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import { getFileName, renderEjsTemplateToStream } from '../../common-modules/server/utils/template';
import { getDiaryDataByDiaryId, getDiaryDataByGroupId } from './queryHelper';
import constant from '../../common-modules/server/config/directory';
import { fillDiaryDataForPrint } from './diaryHelper';

temp.track();

export const templatesDir = path.join(__dirname, '..', '..', 'public', 'templates');

const addCommonMetadataToTemplateData = async (templateData) => {
    templateData.font = 'data:font/truetype;base64,' + await fs.promises.readFile(path.join(constant.assetsDir, 'fonts', 'ELEGANTIBOLD.TTF'), { encoding: 'base64' });
    templateData.img = 'data:image;base64,' + await fs.promises.readFile(path.join(constant.assetsDir, 'img', 'header.jpg'), { encoding: 'base64' });
}

const getDiaryFilenameFromGroup = ({ klass, teacher, lesson }) => `יומן נוכחות ${klass?.name || ''}_${teacher?.name || ''}_${lesson?.name || ''}`;

const addDiaryMetadataToTemplateData = async (templateData, title, diaryDate) => {
    if (templateData.isFilled) {
        templateData.title = title;
    } else {
        const heDate = getJewishDate(diaryDate ? new Date(diaryDate) : new Date());
        templateData.title = title + '- ' + getHebJewishMonthById(heDate.monthName) + ' ' + convertToHebrew(heDate.year);
    }
    await addCommonMetadataToTemplateData(templateData);
}

const getGradeFilenameFromGroup = ({ klass, teacher, lesson }, half) => `דוח ציונים ${klass?.name || ''}_${teacher?.name || ''}_${lesson?.name || ''}_מחצית_${half === 1 ? 'א' : 'ב'}`;

const addGradeMetadataToTemplateData = async (templateData, title, half) => {
    templateData.title = `${title} - ${templateData.group.klass?.name || ''} - מחצית ${half === 1 ? 'א' : 'ב'}`
    templateData.half = half;
    if (half === 1) {
        templateData.headers = ['ציון במבחן', 'ציון לתעודה'];
    } else {
        templateData.headers = ['ציון לתעודה באחוזים','ציוני מטלה א','ציוני מטלה ב','ציוני מבחנים מחצית א','ציוני מבחנים מחצית ב', 'נוכחות (לשימוש המשרד)'];
    }
    await addCommonMetadataToTemplateData(templateData);
}

export async function getDiaryStreamByGroupId(groupId, diaryDate) {
    const templatePath = path.join(templatesDir, "diary.ejs");
    const templateData = await getDiaryDataByGroupId(groupId);
    await addDiaryMetadataToTemplateData(templateData, 'יומן נוכחות', diaryDate);
    const fileStream = await renderEjsTemplateToStream(templatePath, templateData);
    const filename = getDiaryFilenameFromGroup(templateData.group);
    return { fileStream, filename };
}

export async function getDiaryZipStreamByGroups(groups, diaryDate) {
    const archive = archiver('zip');
    var tempStream = temp.createWriteStream({ suffix: '.zip' });
    archive.pipe(tempStream);

    for await (const group of groups) {
        const { fileStream, filename } = await getDiaryStreamByGroupId(group.id, diaryDate);
        archive.append(fileStream, { name: getFileName(filename, 'pdf') });
    }
    await archive.finalize();
    tempStream.close();
    return { fileStream: fs.createReadStream(tempStream.path), filename: 'יומנים' };
}

export async function getDiaryMergedPdfStreamByGroups(groups, diaryDate) {
    var merger = new PDFMerger();

    for (const group of groups) {
        const { fileStream, filename } = await getDiaryStreamByGroupId(group.id, diaryDate);
        const filePath = temp.path({ prefix: filename, suffix: '.pdf' });
        await fs.promises.writeFile(filePath, await streamToBuffer(fileStream));
        merger.add(filePath);
    }

    const tempPath = temp.path({ suffix: '.pdf' });
    await merger.save(tempPath);
    const fileStream = fs.createReadStream(tempPath);

    return { fileStream, filename: 'יומנים' };
}

export async function getDiaryStreamByDiaryId(diaryId, groupId) {
    const templatePath = path.join(templatesDir, "diary.ejs");
    const templateData = await getDiaryDataByGroupId(groupId);
    const diaryData = await getDiaryDataByDiaryId(diaryId);
    await fillDiaryDataForPrint(diaryData, templateData);
    await addDiaryMetadataToTemplateData(templateData, 'יומן נוכחות');
    const fileStream = await renderEjsTemplateToStream(templatePath, templateData);
    const filename = getDiaryFilenameFromGroup(templateData.group);
    return { fileStream, filename };
}

export async function getDiaryMergedPdfStreamByDiaries(diaries) {
    var merger = new PDFMerger();

    for (const diary of diaries) {
        const { fileStream, filename } = await getDiaryStreamByDiaryId(diary.id, diary.group_id);
        const filePath = temp.path({ prefix: filename, suffix: '.pdf' });
        await fs.promises.writeFile(filePath, await streamToBuffer(fileStream));
        merger.add(filePath);
    }

    const tempPath = temp.path({ suffix: '.pdf' });
    await merger.save(tempPath);
    const fileStream = fs.createReadStream(tempPath);

    return { fileStream, filename: 'יומנים' };
}

export async function getGradeStreamByGroupId(groupId, half) {
    const templatePath = path.join(templatesDir, "grade.ejs");
    const templateData = await getDiaryDataByGroupId(groupId);
    await addGradeMetadataToTemplateData(templateData, 'דו"ח ציונים', half);
    const fileStream = await renderEjsTemplateToStream(templatePath, templateData);
    const filename = getGradeFilenameFromGroup(templateData.group, half);
    return { fileStream, filename };
}

export async function getGradeMergedPdfStreamByGroups(groups, half) {
    var merger = new PDFMerger();

    for (const group of groups) {
        const { fileStream, filename } = await getGradeStreamByGroupId(group.id, half);
        const filePath = temp.path({ prefix: filename, suffix: '.pdf' });
        await fs.promises.writeFile(filePath, await streamToBuffer(fileStream));
        merger.add(filePath);
    }

    const tempPath = temp.path({ suffix: '.pdf' });
    await merger.save(tempPath);
    const fileStream = fs.createReadStream(tempPath);

    return { fileStream, filename: 'ציונים' };
}
