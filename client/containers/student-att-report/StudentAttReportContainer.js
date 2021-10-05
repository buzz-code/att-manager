import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'student_tz', title: 'מספר תז' },
  { field: 'student_name', title: 'תלמידה' },
  { field: 'absences_1', title: 'בסיס' },
  { field: 'absences_2', title: 'התמחות' },
  { field: 'absences_3', title: 'עבודה מעשית' },
  { field: 'absences_null', title: 'אחר' },
];
const getFilters = () => [
  { field: 'students.name', label: 'תלמידה', type: 'text', operator: 'like' },
  { field: 'klasses.name', label: 'כיתה', type: 'text', operator: 'like' },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
];

const StudentAttReportContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} disableAdd={true} disableDelete={true} disableUpdate={true} />;
};

export default StudentAttReportContainer;
