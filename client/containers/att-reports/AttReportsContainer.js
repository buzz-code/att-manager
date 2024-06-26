import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear } from '../../services/yearService';

const getColumns = ({ students, teachers, lessons, attTypes }) => [
  { field: 'student_tz', title: 'תלמידה', columnOrder: 'students.name', ...getPropsForAutoComplete('student_tz', students, 'tz') },
  { field: 'teacher_id', title: 'מורה', columnOrder: 'teachers.name', ...getPropsForAutoComplete('teacher_id', teachers, 'tz') },
  { field: 'lesson_id', title: 'שיעור', columnOrder: 'lessons.name', ...getPropsForAutoComplete('lesson_id', lessons, 'key') },
  { field: 'att_type_id', title: 'סוג דיווח', columnOrder: 'att_types.name', ...getPropsForAutoComplete('att_type_id', attTypes, 'key') },
  { field: 'enter_time', title: 'שעת כניסה' },
];
const getFilters = ({ students, teachers, lessons, attTypes }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: students, idField: 'tz' },
  { field: 'teachers.tz', label: 'מורה', type: 'list', operator: 'eq', list: teachers, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
  { field: 'att_types.key', label: 'סוג דיווח', type: 'list', operator: 'eq', list: attTypes, idField: 'key' },
  { field: 'enter_time', label: 'שעת כניסה', type: 'text', operator: 'like' },
];

const AttReportsContainer = ({ entity, title }) => {
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

export default AttReportsContainer;
