import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { yearsList } from '../../../server/utils/listHelper';

const getColumns = ({ klasses, teachers, lessons }) => [
  { field: 'klass_id', title: 'כיתה', columnOrder: 'klasses.name', ...getPropsForAutoComplete('klass_id', klasses, 'key') },
  { field: 'teacher_id', title: 'מורה', columnOrder: 'teachers.name', ...getPropsForAutoComplete('teacher_id', teachers, 'tz') },
  { field: 'lesson_id', title: 'שיעור', columnOrder: 'lessons.name', ...getPropsForAutoComplete('lesson_id', lessons, 'key') },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
];
const getFilters = ({ klasses, teachers, lessons }) => [
  { field: 'klasses.key', label: 'כיתה', type: 'list', operator: 'eq', list: klasses, idField: 'key' },
  { field: 'teachers.tz', label: 'מורה', type: 'list', operator: 'eq', list: teachers, idField: 'tz' },
  { field: 'lessons.key', label: 'שיעור', type: 'list', operator: 'eq', list: lessons, idField: 'key' },
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: 5783 },
];
const getActions = (handlePrintAll1, handlePrintAll2, handlePrintOne1, handlePrintOne2, handleDownloadExcel1, handleDownloadExcel2) => [
  {
    icon: 'print',
    tooltip: 'הדפס הכל מחצית א',
    isFreeAction: true,
    onClick: handlePrintAll1,
  },
  {
    icon: 'print',
    tooltip: 'הדפס הכל מחצית ב',
    isFreeAction: true,
    onClick: handlePrintAll2,
  },
  rowData => ({
    disabled: !rowData.klass_id,
    icon: 'print',
    tooltip: 'הדפס ציונים למחצית א',
    onClick: handlePrintOne1,
  }),
  rowData => ({
    disabled: !rowData.klass_id,
    icon: 'print',
    tooltip: 'הדפס ציונים למחצית ב',
    onClick: handlePrintOne2,
  }),
  rowData => ({
    disabled: !rowData.klass_id,
    icon: 'border_all',
    tooltip: 'הורדת אקסל למחצית א',
    onClick: handleDownloadExcel1,
  }),
  rowData => ({
    disabled: !rowData.klass_id,
    icon: 'border_all',
    tooltip: 'הורדת אקסל למחצית ב',
    onClick: handleDownloadExcel2,
  }),
];

const GradesPrintContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const [conditions, setConditions] = useState({});

  const handlePrintAll1 = useCallback(() => {
    dispatch(crudAction.download(entity, 'POST', 'print-all-grades', { filters: conditions, half: 1 }));
  }, [entity, conditions]);
  const handlePrintAll2 = useCallback(() => {
    dispatch(crudAction.download(entity, 'POST', 'print-all-grades', { filters: conditions, half: 2 }));
  }, [entity, conditions]);
  const handlePrintOne1 = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'print-one-grade', { id: rowData.id, half: 1 }));
  }, [entity, conditions]);
  const handlePrintOne2 = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'print-one-grade', { id: rowData.id, half: 2 }));
  }, [entity, conditions]);
  const handleDownloadExcel1 = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'excel-one-grade', { id: rowData.id, half: 1 }));
  }, [entity, conditions]);
  const handleDownloadExcel2 = useCallback((e, rowData) => {
    dispatch(crudAction.download(entity, 'POST', 'excel-one-grade', { id: rowData.id, half: 2 }));
  }, [entity, conditions]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);
  const actions = useMemo(() => getActions(handlePrintAll1, handlePrintAll2, handlePrintOne1, handlePrintOne2, handleDownloadExcel1, handleDownloadExcel2), [handlePrintAll1, handlePrintAll2, handlePrintOne1, handlePrintOne2]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  return <>
    <Table entity={entity} title={title} columns={columns} filters={filters} additionalActions={actions} disableAdd={true} disableUpdate={true} disableDelete={true} onConditionUpdate={setConditions} />
  </>;
};

export default GradesPrintContainer;
