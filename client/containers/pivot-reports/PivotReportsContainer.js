import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import {
  getColumnsForPivot,
  getPropsForAutoComplete,
} from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ students }, data) => [
  {
    field: 'tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('tz', students, 'tz'),
  },
  { field: 'student_base_klass', title: 'כיתת בסיס', sorting: false },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
  ...getColumnsForPivot(data),
  { field: 'total', title: 'סה"כ', sorting: false },
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
  { field: 'student_klasses.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear },
  { field: 'lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];

const PivotReportsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    data,
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}, data || []), [editData, data]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data'));
  }, []);

  const getExportColumns = useCallback((data) => getColumns(editData || {}, data || []), [
    editData,
  ]);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      disableAdd={true}
      disableUpdate={true}
      disableDelete={true}
      getExportColumns={getExportColumns}
    />
  );
};

export default PivotReportsContainer;
