import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJewishDate, formatJewishDateHebrew } from 'jewish-dates-core';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = ({ }) => [
  { field: 'student_tz', title: 'תז תלמידה', columnOrder: 'students.tz' },
  { field: 'student_name', title: 'תלמידה', columnOrder: 'students.name' },
  { field: 'student_base_klass', title: 'כיתת בסיס', columnOrder: 'students.name' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList) },
  { field: 'teacher_name', title: 'מורה', columnOrder: 'teachers.name' },
  { field: 'klass_name', title: 'כיתה', columnOrder: 'klasses.name' },
  { field: 'lesson_name', title: 'שיעור', columnOrder: 'lessons.name' },
  { field: 'lesson_date', title: 'תאריך', render: ({ lesson_date }) => lesson_date && formatJewishDateHebrew(getJewishDate(new Date(lesson_date))), isHebrewDate: true },
  { field: 'att_type_name', title: 'סוג היעדרות', columnOrder: 'att_types.name' },
];
const getFilters = ({ students, teachers, klasses, lessons, attTypes }) => [
  { field: 'students.tz', label: 'תז תלמידה', type: 'text', operator: 'like' },
  {
    field: 'students.tz',
    label: 'תלמידה',
    type: 'list',
    operator: 'eq',
    list: students,
    idField: 'tz',
  },
  {
    field: 'klasses.key',
    label: 'כיתה',
    type: 'list',
    operator: 'eq',
    list: klasses,
    idField: 'key',
  },
  {
    field: 'teachers.tz',
    label: 'מורה',
    type: 'list',
    operator: 'eq',
    list: teachers,
    idField: 'tz',
  },
  {
    field: 'lessons.key',
    label: 'שיעור',
    type: 'list',
    operator: 'eq',
    list: lessons,
    idField: 'key',
  },
  {
    field: 'att_types.key',
    label: 'סוג היעדרות',
    type: 'list',
    operator: 'eq',
    list: attTypes,
    idField: 'key',
  },
  { field: 'diary_lessons.lesson_date', label: 'מתאריך', type: 'date', operator: 'date-before' },
  { field: 'diary_lessons.lesson_date', label: 'עד תאריך', type: 'date', operator: 'date-after' },
  { field: 'groups.year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
];
const getActions = (handleApproveAll, handleApproveOne, handleApproveSome) => [
  {
    icon: 'event_available',
    tooltip: 'אשר הכל',
    isFreeAction: true,
    onClick: handleApproveAll,
  },
  // {
  //   icon: 'event_available',
  //   tooltip: 'אשר חיסור',
  //   onClick: handleApproveOne,
  // },
  {
    icon: 'event_available',
    tooltip: 'אשר חיסורים',
    onClick: handleApproveSome,
  },
];

const DiaryInstancesReportsContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { '../get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const [conditions, setConditions] = useState({});

  const handleApproveAll = useCallback(() => {
    dispatch(crudAction.customHttpRequest(entity, 'POST', '../approve-all-instances', { filters: conditions }));
  }, [entity, conditions]);
  const handleApproveSome = useCallback((e, selectedRows) => {
    dispatch(crudAction.customHttpRequest(entity, 'POST', '../approve-some-instances', { ids: selectedRows.map(item => item.id) }));
  }, [entity]);
  const handleApproveOne = useCallback((e, rowData) => {
    handleApproveSome(e, [rowData]);
  }, [handleApproveSome]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);
  const actions = useMemo(() => getActions(handleApproveAll, handleApproveOne, handleApproveSome), [handleApproveAll, handleApproveOne, handleApproveSome]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', '../get-edit-data', { year: defaultYear }));
  }, []);

  return (
    <Table
      entity={entity}
      title={title}
      columns={columns}
      filters={filters}
      additionalActions={actions}
      disableAdd={true}
      disableUpdate={true}
      disableDelete={true}
      onConditionUpdate={setConditions}
      customMaterialOptions={{
        selection: true,
      }}
    />
  );
};

export default DiaryInstancesReportsContainer;
