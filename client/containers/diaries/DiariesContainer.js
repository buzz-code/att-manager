import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = () => [
  { field: 'group_name', title: 'קבוצה' },
  { field: 'first_lesson', title: 'שיעור ראשון', render: ({ first_lesson }) => first_lesson && formatJewishDateHebrew(getJewishDate(new Date(first_lesson))), isHebrewDate: true },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
];
const getFilters = ({ klasses, teachers, lessons }) => [
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'teachers.tz', label: 'מורה', type: 'list', operator: 'eq', list: teachers, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];
const getActions = (handlePrintAll, handlePrintOne, handleOpenDiary) => [
  {
    icon: 'print',
    tooltip: 'הדפס הכל',
    isFreeAction: true,
    onClick: handlePrintAll,
  },
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

  const [conditions, setConditions] = useState({});

  const handlePrintAll = useCallback(() => {
    dispatch(crudAction.download(entity, 'POST', 'print-all-diaries', { filters: conditions }));
  }, [entity, conditions]);
  const handlePrintOne = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'print-one-diary', { id: rowData.id, group_id: rowData.group_id }));
  }, [entity]);
  const handleOpenDiary = useCallback((e, rowData) => {
    window.open('/diary-edit/' + rowData.group_id + '/' + rowData.id, '_blank');
  }, []);

  const columns = useMemo(() => getColumns(), []);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);
  const actions = useMemo(() => getActions(handlePrintAll, handlePrintOne, handleOpenDiary), [handlePrintAll, handlePrintOne, handleOpenDiary]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../groups/get-edit-data', { year: defaultYear }));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} additionalActions={actions} disableAdd={true} disableUpdate={true} onConditionUpdate={setConditions} />
};

export default DiariesContainer;
