import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';

import { yearsList } from '../../../server/utils/listHelper';

const getColumns = () => [
  { field: 'student_tz', title: 'מספר תז' },
  { field: 'student_name', title: 'תלמידה' },
  { field: 'klasses_1', title: 'בסיס' },
  { field: 'klasses_2', title: 'התמחות' },
  { field: 'klasses_3', title: 'עבודה מעשית' },
  { field: 'klasses_null', title: 'אחר' },
];
const getFilters = ({ students, klasses }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: students, idField: 'tz' },
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'student_klasses.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: 5783 },
];

const StudentKlassesKlassTypeontainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data'));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} disableAdd={true} disableDelete={true} disableUpdate={true} />;
};

export default StudentKlassesKlassTypeontainer;
