import path from 'path';
import { renderExcelTemplateToStream } from "../../common-modules/server/utils/template";
import { addGradeMetadataToTemplateData, getGradeFilenameFromGroup, templatesDir } from "./printHelper";
import { getDiaryDataByGroupId } from "./queryHelper";

export async function getGradeExcelStreamByGroupId(groupId, half) {
    const templatePath = path.join(templatesDir, `grade.xlsx`);
    const templateData = await getDiaryDataByGroupId(groupId);
    await addGradeMetadataToTemplateData(templateData, 'דו"ח ציונים', half, false);
    templateData.students.forEach((item, index) => {
        item.number = index + 1;
        item.empty = templateData.headers.map(item => '')
    });
    const fileStream = await renderExcelTemplateToStream(templatePath, templateData);
    const filename = getGradeFilenameFromGroup(templateData.group, half);
    return { fileStream, filename };
}
