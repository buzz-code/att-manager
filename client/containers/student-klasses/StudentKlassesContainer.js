import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const today = () => moment().format('YYYY-MM-DD');

const getColumns = ({ studentsByYear, klasses }) => [
  { field: 'student_tz', title: 'מספר תז', editable: 'never' },
  { field: 'student_tz', title: 'תלמידה', columnOrder: 'students.name', ...getPropsForAutoComplete('student_tz', studentsByYear, 'tz') },
  { field: 'klass_id', title: 'כיתה', columnOrder: 'klasses.name', ...getPropsForAutoComplete('klass_id', klasses, 'key') },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList), initialEditValue: defaultYear },
  { field: 'start_date', title: 'תאריך התחלה', type: 'date' },
  { field: 'end_date', title: 'תאריך סיום', type: 'date' },
];
const getFilters = ({ studentsByYear, klasses }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: studentsByYear, idField: 'tz' },
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'student_klasses.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
  { field: 'student_klasses.start_date', label: 'תאריך התחלה מ', type: 'date', operator: 'date-after', defaultValue: today() },
  { field: 'student_klasses.start_date', label: 'תאריך התחלה עד', type: 'date', operator: 'date-before' },
  { field: 'student_klasses.end_date', label: 'תאריך סיום מ', type: 'date', operator: 'date-after' },
  { field: 'student_klasses.end_date', label: 'תאריך סיום עד', type: 'date', operator: 'date-before', defaultValue: today() },
];

const StudentKlassesContainer = ({ entity, title }) => {
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

export default StudentKlassesContainer;
