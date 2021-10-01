import React, { useMemo, useCallback } from 'react';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';
import { useHistory } from 'react-router';

import Table from '../../../common-modules/client/components/table/Table';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
  { field: 'first_lesson', title: 'שיעור ראשון', render: ({ first_lesson }) => first_lesson && formatJewishDateHebrew(getJewishDate(new Date(first_lesson))) },
];
const getFilters = () => [
  // { field: 'group_name', label: 'קבוצה', type: 'text', operator: 'like' },
];
const getActions = (handleOpenDiary) => [
  {
    icon: 'today',
    tooltip: 'ערוך יומן',
    onClick: handleOpenDiary,
  },
];

const DiariesContainer = ({ entity, title }) => {
  const history = useHistory();

  const handleOpenDiary = useCallback((e, rowData) => {
    history.push('/diary-edit/' + rowData.group_id + '/' + rowData.id);
  }, []);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);
  const actions = useMemo(() => getActions(handleOpenDiary), [handleOpenDiary]);

  return <Table entity={entity} title={title} columns={columns} filters={filters} additionalActions={actions} disableAdd={true} disableUpdate={true} />;
};

export default DiariesContainer;
