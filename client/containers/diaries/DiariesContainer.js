import React, { useMemo, useCallback } from 'react';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
  { field: 'first_lesson', title: 'שיעור ראשון', render: ({ first_lesson }) => first_lesson && formatJewishDateHebrew(getJewishDate(new Date(first_lesson))) },
];
const getFilters = () => [
  // { field: 'group_name', label: 'קבוצה', type: 'text', operator: 'like' },
];
const getActions = (handlePrintOne, handleOpenDiary) => [
  {
    icon: 'print',
    tooltip: 'הדפס יומן',
    onClick: handlePrintOne,
  },
  {
    icon: 'today',
    tooltip: 'ערוך יומן',
    onClick: handleOpenDiary,
  },
];

const DiariesContainer = ({ entity, title }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handlePrintOne = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'print-one-diary', { id: rowData.id, group_id: rowData.group_id }));
  }, [entity]);
  const handleOpenDiary = useCallback((e, rowData) => {
    history.push('/diary-edit/' + rowData.group_id + '/' + rowData.id);
  }, []);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(), []);
  const actions = useMemo(() => getActions(handlePrintOne, handleOpenDiary), [handlePrintOne, handleOpenDiary]);

  return <Table entity={entity} title={title} columns={columns} filters={filters} additionalActions={actions} disableAdd={true} disableUpdate={true} />;
};

export default DiariesContainer;
