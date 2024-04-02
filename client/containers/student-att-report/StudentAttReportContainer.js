import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = () => [
  //   { field: 'student_tz', title: 'מספר תז' },
  { field: 'student_name', title: 'תלמידה' },
  { field: 'student_base_klass', title: 'כיתה' },
  { field: 'absences_1_late', title: 'בסיס- איחורים' },
  { field: 'absences_1_abs', title: 'בסיס- חיסורים' },
  { field: 'absences_1_appr', title: 'בסיס- מאושרים' },
  { field: 'absences_2_late', title: 'התמחות- איחורים' },
  { field: 'absences_2_abs', title: 'התמחות- חיסורים' },
  { field: 'absences_2_appr', title: 'התמחות- מאושרים' },
  { field: 'absences_3_late', title: 'עבודה מעשית- איחורים' },
  { field: 'absences_3_abs', title: 'עבודה מעשית- חיסורים' },
  { field: 'absences_3_appr', title: 'עבודה מעשית- מאושרים' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
];
const getFilters = ({ students, klasses }) => [
  { field: 'students.tz', label: 'תלמידה', type: 'list', operator: 'eq', list: students, idField: 'tz' },
  { field: 'student_base_klass', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];

const StudentAttReportContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../../student-klasses/get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../../student-klasses/get-edit-data', { year: defaultYear }));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} disableAdd={true} disableDelete={true} disableUpdate={true} />;
};

export default StudentAttReportContainer;
