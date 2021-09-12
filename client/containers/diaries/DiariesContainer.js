import React, { useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
];
const getFilters = () => [
  // { field: 'group_name', label: 'קבוצה', type: 'text', operator: 'like' },
];

const DiariesContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default DiariesContainer;
