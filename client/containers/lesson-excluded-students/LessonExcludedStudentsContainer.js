import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ students, lessons }) => [
  { field: 'student_tz', title: 'מספר תז', editable: 'never' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', students, 'tz'),
  },
  {
    field: 'lesson_id',
    title: 'שיעור',
    columnOrder: 'lessons.name',
    ...getPropsForAutoComplete('lesson_id', lessons, 'key'),
  },
  {
    field: 'year',
    title: 'שנה',
    ...getPropsForAutoComplete('year', yearsList),
    initialEditValue: defaultYear,
  },
];
const getFilters = ({ students, lessons }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: students, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
  {
    field: 'lesson_excluded_students.year',
    label: 'שנה',
    type: 'list',
    operator: 'eq',
    list: yearsList,
    defaultValue: defaultYear,
    disabled: true,
  },
];

const LessonExcludedStudentsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data', { year: defaultYear }));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default LessonExcludedStudentsContainer;
