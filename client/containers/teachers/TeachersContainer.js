import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'tz', title: 'תעודת זהות' },
  { field: 'name', title: 'שם' },
  { field: 'phone', title: 'מספר טלפון' },
  { field: 'phone2', title: 'טלפון נייח' },
  { field: 'address', title: 'כתובת' },
  { field: 'city', title: 'עיר' },
];
const getFilters = () => [
  { field: 'tz', label: 'תעודת זהות', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'phone', label: 'מספר טלפון', type: 'text', operator: 'like' },
  { field: 'phone2', label: 'טלפון נייח', type: 'text', operator: 'like' },
  { field: 'address', label: 'כתובת', type: 'text', operator: 'like' },
  { field: 'city', label: 'עיר', type: 'text', operator: 'like' },
];

const TeachersContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default TeachersContainer;
