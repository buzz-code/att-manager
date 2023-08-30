import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ }) => [
  { field: 'teacher_name', title: 'מורה' },
  { field: 'klass_name', title: 'כיתה' },
  { field: 'lesson_name', title: 'שיעור' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
  { field: 'teacher_lessons_count', title: 'שיעורי המורה' },
  { field: 'teacher_lessons_abs_count', title: 'שיעורי מילוי מקום' },
  { field: 'total_lessons', title: 'סה"כ שיעורים' },
];
const getFilters = ({ teachers, klasses, lessons }) => [
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
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];

const TeacherAttReportsContainer = ({ entity, title }) => {
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

export default TeacherAttReportsContainer;
