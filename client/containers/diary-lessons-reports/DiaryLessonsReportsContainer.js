import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';

const getColumns = ({ }) => [
  { field: 'student_tz', title: 'תז תלמידה', columnOrder: 'students.tz' },
  { field: 'student_name', title: 'תלמידה' },
  { field: 'student_base_klass', title: 'כיתת בסיס' },
  { field: 'teacher_name', title: 'מורה' },
  { field: 'klass_name', title: 'כיתה' },
  { field: 'lesson_name', title: 'שיעור' },
  { field: 'total_lessons', title: 'סה"כ שיעורים' },
  { field: 'abs_count', title: 'חיסורים' },
  { field: 'abs_percents', title: 'אחוז חיסורים', columnOrder: 'abs_count_num' },
];
const getFilters = ({ students, teachers, klasses, lessons }) => [
  { field: 'students.tz', label: 'תז תלמידה', type: 'text', operator: 'like' },
  {
    field: 'students.tz',
    label: 'תלמידה',
    type: 'list',
    operator: 'eq',
    list: students,
    idField: 'tz',
  },
  { field: 'student_base_klass.klass_name', label: 'כיתת בסיס', type: 'text', operator: 'like' },
  {
    field: 'klasses.key',
    label: 'כיתה',
    type: 'list',
    operator: 'eq',
    list: klasses,
    idField: 'key',
  },
  {
    field: 'teachers.tz',
    label: 'מורה',
    type: 'list',
    operator: 'eq',
    list: teachers,
    idField: 'tz',
  },
  {
    field: 'lessons.key',
    label: 'שיעור',
    type: 'list',
    operator: 'eq',
    list: lessons,
    idField: 'key',
  },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];

const DiaryLessonsReportsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data'));
  }, []);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      disableAdd={true}
      disableUpdate={true}
      disableDelete={true}
    />
  );
};

export default DiaryLessonsReportsContainer;
