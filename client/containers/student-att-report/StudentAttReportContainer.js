import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';

const getColumns = () => [
  { field: 'student_tz', title: 'מספר תז' },
  { field: 'student_name', title: 'תלמידה' },
  { field: 'absences_1', title: 'בסיס' },
  { field: 'absences_2', title: 'התמחות' },
  { field: 'absences_3', title: 'עבודה מעשית' },
  { field: 'absences_null', title: 'אחר' },
];
const getFilters = ({ students, klasses }) => [
  { field: 'students.name', label: 'תלמידה', type: 'list', operator: 'like', list: students, idField: 'tz' },
  { field: 'klasses.name', label: 'כיתה', type: 'list', operator: 'like', list: klasses, idField: 'key' },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];

const StudentAttReportContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../../student-klasses/get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../../student-klasses/get-edit-data'));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} disableAdd={true} disableDelete={true} disableUpdate={true} />;
};

export default StudentAttReportContainer;
