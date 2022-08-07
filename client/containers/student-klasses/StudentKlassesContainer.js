import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { yearsList } from '../../../server/utils/listHelper';

const getColumns = ({ students, klasses }) => [
  { field: 'student_tz', title: 'מספר תז', editable: 'never' },
  { field: 'student_tz', title: 'תלמידה', columnOrder: 'students.name', ...getPropsForAutoComplete('student_tz', students, 'tz') },
  { field: 'klass_id', title: 'כיתה', columnOrder: 'klasses.name', ...getPropsForAutoComplete('klass_id', klasses, 'key') },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
];
const getFilters = ({ students, klasses }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: students, idField: 'tz' },
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: 5783 },
];

const StudentKlassesContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default StudentKlassesContainer;
