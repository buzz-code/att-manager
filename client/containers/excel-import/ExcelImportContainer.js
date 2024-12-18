import React from 'react';

import * as entities from '../../constants/entity';
import * as titles from '../../constants/entity-title';
import ExcelImport from '../../../common-modules/client/components/excel-import/ExcelImport';

const title = 'העלאת קובץ';
const supportedEntities = [
  { value: entities.TEACHERS, title: titles.TEACHERS, columns: ['tz', 'name', 'phone', 'phone2', 'address', 'city'] },
  { value: entities.STUDENTS, title: titles.STUDENTS, columns: ['tz', 'name', 'address', 'city', 'phone', 'mother_phone', 'father_phone', 'birth_date', 'school_klass', 'father_name', 'comment', 'year'] },
  { value: entities.LESSONS, title: titles.LESSONS, columns: ['key', 'name', 'year'] },
  { value: entities.KLASSS, title: titles.KLASSS, columns: ['key', 'name', 'year'] },
  {
    value: entities.STUDENT_KLASSES,
    title: titles.STUDENT_KLASSES,
    columns: ['student_tz', 'klass_id', 'year'],
  },
  {
    value: entities.GROUPS,
    title: titles.GROUPS,
    columns: ['klass_id', 'teacher_id', 'lesson_id', 'day_count', 'lesson_count', 'year'],
  },
  { value: entities.ATT_TYPES, title: titles.ATT_TYPES, columns: ['key', 'name'] },
];

const ExcelImportContainer = () => {
  return <ExcelImport title={title} supportedEntities={supportedEntities} />;
};

export default ExcelImportContainer;
