import React, { useMemo } from 'react';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
  { field: 'first_lesson', title: 'שיעור ראשון', render: ({ first_lesson }) => first_lesson && formatJewishDateHebrew(getJewishDate(new Date(first_lesson))) },
];
const getFilters = () => [
  // { field: 'group_name', label: 'קבוצה', type: 'text', operator: 'like' },
];

const DiariesContainer = ({ entity, title }) => {
  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} disableAdd={true} disableUpdate={true} />;
};

export default DiariesContainer;
