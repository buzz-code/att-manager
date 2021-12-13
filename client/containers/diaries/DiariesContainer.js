import React, { useEffect, useMemo, useCallback } from 'react';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
  { field: 'first_lesson', title: 'שיעור ראשון', render: ({ first_lesson }) => first_lesson && formatJewishDateHebrew(getJewishDate(new Date(first_lesson))), isHebrewDate: true },
];
const getFilters = ({ klasses, teachers, lessons }) => [
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'teachers.tz', label: 'מורה', type: 'list', operator: 'eq', list: teachers, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
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
  const {
    GET: { '../groups/get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const handlePrintOne = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'print-one-diary', { id: rowData.id, group_id: rowData.group_id }));
  }, [entity]);
  const handleOpenDiary = useCallback((e, rowData) => {
    history.push('/diary-edit/' + rowData.group_id + '/' + rowData.id);
  }, []);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);
  const actions = useMemo(() => getActions(handlePrintOne, handleOpenDiary), [handlePrintOne, handleOpenDiary]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../groups/get-edit-data'));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} additionalActions={actions} disableAdd={true} disableUpdate={true} />;
};

export default DiariesContainer;
