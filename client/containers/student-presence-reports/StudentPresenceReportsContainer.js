import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ klassTypes }) => [
  { field: 'student_tz', title: 'תז תלמידה', columnOrder: 'students.tz' },
  { field: 'student_name', title: 'תלמידה', columnOrder: 'students.name' },
  { field: 'student_base_klass', title: 'כיתת בסיס' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
  { field: 'teacher_name', title: 'מורה', columnOrder: 'teachers.name' },
  { field: 'klass_name', title: 'כיתה', columnOrder: 'klasses.name' },
  { field: 'lesson_name', title: 'שיעור', columnOrder: 'lessons.name' },
  { field: 'lesson_date', title: 'תאריך', render: ({ lesson_date }) => lesson_date && formatJewishDateHebrew(getJewishDate(new Date(lesson_date))), isHebrewDate: true },
];
const getFilters = ({ students, klassTypes }) => [
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
  { field: 'klasses.klass_type_id', label: 'סוג כיתה', type: 'list', operator: 'eq', list: klassTypes, idField: 'id' },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'student_base_klass.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];

const StudentPresenceReportsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data', { year: defaultYear }));
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

export default StudentPresenceReportsContainer;
