import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ klasses, teachers, lessons }) => [
  { field: 'klass_id', title: 'כיתה', columnOrder: 'klasses.name', ...getPropsForAutoComplete('klass_id', klasses, 'key') },
  { field: 'teacher_id', title: 'מורה', columnOrder: 'teachers.name', ...getPropsForAutoComplete('teacher_id', teachers, 'tz') },
  { field: 'lesson_id', title: 'שיעור', columnOrder: 'lessons.name', ...getPropsForAutoComplete('lesson_id', lessons, 'key') },
  { field: 'day_count', title: 'מספר ימים', type: 'numeric' },
  { field: 'lesson_count', title: 'מספר שיעורים', type: 'numeric' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList), initialEditValue: defaultYear },
];
const getFilters = ({ klasses, teachers, lessons }) => [
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'teachers.tz', label: 'מורה', type: 'list', operator: 'eq', list: teachers, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];

const GroupsContainer = ({ entity, title }) => {
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

export default GroupsContainer;
