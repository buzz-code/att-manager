import moment from 'moment';
import React, { useCallback, useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'tz', title: 'תעודת זהות' },
  { field: 'name', title: 'שם' },
  { field: 'address', title: 'כתובת' },
  { field: 'phone', title: 'טלפון בית' },
  { field: 'mother_phone', title: 'נייד אם' },
  { field: 'father_phone', title: 'נייד אב' },
  { field: 'birth_date', title: 'תאריך לידה', type: 'date' },
  { field: 'school_klass', title: 'כיתת תיכון' },
  { field: 'father_name', title: 'שם מלא אב' },
];
const getFilters = () => [
  { field: 'tz', label: 'תעודת זהות', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'address', label: 'כתובת', type: 'text', operator: 'like' },
  { field: 'phone', label: 'טלפון בית', type: 'text', operator: 'like' },
  { field: 'school_klass', label: 'כיתת תיכון', type: 'text', operator: 'like' },
];

const StudentsContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  const manipulateDataToSave = useCallback((dataToSave) => ({
    ...dataToSave,
    birth_date: dataToSave.birth_date
      ? moment(dataToSave.birth_date).format('yyyy-MM-DD')
      : null
  }), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} manipulateDataToSave={manipulateDataToSave} />;
};

export default StudentsContainer;
