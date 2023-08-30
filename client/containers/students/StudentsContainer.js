import moment from 'moment';
import React, { useCallback, useMemo } from 'react';

import Table from '../../../common-modules/client/components/table/Table';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const getColumns = () => [
  { field: 'tz', title: 'תעודת זהות' },
  { field: 'name', title: 'שם' },
  { field: 'address', title: 'כתובת' },
  { field: 'city', title: 'עיר' },
  { field: 'phone', title: 'טלפון בית' },
  { field: 'mother_phone', title: 'נייד אם' },
  { field: 'father_phone', title: 'נייד אב' },
  { field: 'birth_date', title: 'תאריך לידה', type: 'date' },
  { field: 'school_klass', title: 'כיתת תיכון' },
  { field: 'father_name', title: 'שם מלא אב' },
  { field: 'comment', title: 'הערה' },
  { field: 'year', title: 'שנה', ...getPropsForAutoComplete('year', yearsList), initialEditValue: defaultYear },
];
const getFilters = () => [
  { field: 'tz', label: 'תעודת זהות', type: 'text', operator: 'like' },
  { field: 'name', label: 'שם', type: 'text', operator: 'like' },
  { field: 'address', label: 'כתובת', type: 'text', operator: 'like' },
  { field: 'city', label: 'עיר', type: 'text', operator: 'like' },
  { field: 'phone', label: 'טלפון בית', type: 'text', operator: 'like' },
  { field: 'school_klass', label: 'כיתת תיכון', type: 'text', operator: 'like' },
  { field: 'year', label: 'שנה', type: 'list', operator: 'eq', list: yearsList, defaultValue: defaultYear, disabled: true },
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
