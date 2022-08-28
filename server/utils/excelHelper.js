import path from 'path';
import { renderExcelTemplateToStream } from "../../common-modules/server/utils/template";
import { templatesDir } from "./printHelper";
import { getDiaryDataByGroupId } from "./queryHelper";

const getGradeFilenameFromGroup = ({ klass, teacher, lesson }) => `דוח ציונים ${klass?.name || ''}_${teacher?.name || ''}_${lesson?.name || ''}`;

export async function getGradeExcelStreamByGroupId(groupId) {
    const templatePath = path.join(templatesDir, "grade.xlsx");
    const templateData = await getDiaryDataByGroupId(groupId);
    const fileStream = await renderExcelTemplateToStream(templatePath, templateData);
    const filename = getGradeFilenameFromGroup(templateData.group);
    return { fileStream, filename };
}
