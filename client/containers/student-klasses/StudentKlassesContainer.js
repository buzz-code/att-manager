import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';
import { getOptionLabelFunc } from '../../../common-modules/client/utils/queryUtil';

import { defaultYear, yearsList } from '../../services/yearService';

const today = () => moment().format('YYYY-MM-DD');

const getColumns = ({ studentsByYear, klasses }) => [
  { field: 'student_tz', title: 'מספר תז', editable: 'never' },
  {
    field: 'student_tz',
    title: 'תלמידה',
    columnOrder: 'students.name',
    ...getPropsForAutoComplete('student_tz', studentsByYear, 'tz'),
  },
  {
    field: 'klass_id',
    title: 'כיתה',
    columnOrder: 'klasses.name',
    ...getPropsForAutoComplete('klass_id', klasses, 'key'),
  },
  {
    field: 'year',
    title: 'שנה',
    ...getPropsForAutoComplete('year', yearsList),
    initialEditValue: defaultYear,
  },
  { field: 'start_date', title: 'תאריך התחלה', type: 'date' },
  { field: 'end_date', title: 'תאריך סיום', type: 'date' },
];
const getFilters = ({ studentsByYear, klasses }) => [
  {
    field: 'students.tz',
    label: 'תלמידה',
    type: 'list',
    operator: 'eq',
    list: studentsByYear,
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
    field: 'student_klasses.year',
    label: 'שנה',
    type: 'list',
    operator: 'eq',
    list: yearsList,
    defaultValue: defaultYear,
    disabled: true,
  },
  {
    field: 'student_klasses.start_date',
    label: 'תאריך התחלה מ',
    type: 'date',
    operator: 'date-before-or-null',
    defaultValue: today(),
  },
  {
    field: 'student_klasses.start_date',
    label: 'תאריך התחלה עד',
    type: 'date',
    operator: 'date-after-or-null',
  },
  {
    field: 'student_klasses.end_date',
    label: 'תאריך סיום מ',
    type: 'date',
    operator: 'date-before-or-null',
  },
  {
    field: 'student_klasses.end_date',
    label: 'תאריך סיום עד',
    type: 'date',
    operator: 'date-after-or-null',
    defaultValue: today(),
  },
];
const isBaseKlassRow = (rowData, klasses, baseKlassTypeId) =>
  klasses?.find((k) => k.key === rowData.klass_id)?.klass_type_id === baseKlassTypeId;

const getActions = (handleOpenSwitchKlass, klasses, baseKlassTypeId) => [
  (rowData) => ({
    icon: 'swap_horiz',
    tooltip: isBaseKlassRow(rowData, klasses, baseKlassTypeId)
      ? 'לא ניתן להחליף כיתת בסיס - היא קבועה לאורך השנה'
      : 'העבר לכיתה אחרת',
    disabled: isBaseKlassRow(rowData, klasses, baseKlassTypeId),
    onClick: () => handleOpenSwitchKlass(rowData),
  }),
];

const SwitchKlassDialog = ({ open, row, klasses, students, onClose, onConfirm }) => {
  const [newKlassId, setNewKlassId] = useState('');
  const [switchDate, setSwitchDate] = useState(today());

  useEffect(() => {
    if (open) {
      setNewKlassId('');
      setSwitchDate(today());
    }
  }, [open, row]);

  const currentKlass = klasses?.find((k) => k.key === row?.klass_id);
  const currentKlassName = getOptionLabelFunc(klasses, 'key')(row?.klass_id);
  const studentName = getOptionLabelFunc(students, 'tz')(row?.student_tz) || row?.student_tz;
  // only offer klasses of the same type - switching type (e.g. speciality -> maasit) isn't a "switch", and base klasses never change
  const sameTypeKlasses = klasses?.filter(
    (k) => k.klass_type_id === currentKlass?.klass_type_id && k.key !== row?.klass_id
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>העברת {studentName} לכיתה אחרת</DialogTitle>
      <DialogContent>
        <TextField
          label="כיתה נוכחית"
          value={currentKlassName}
          disabled
          fullWidth
          margin="normal"
        />
        <Autocomplete
          options={sameTypeKlasses || []}
          getOptionLabel={getOptionLabelFunc(sameTypeKlasses, 'key')}
          value={sameTypeKlasses?.find((k) => k.key === newKlassId) ?? null}
          onChange={(e, value) => setNewKlassId(value?.key ?? '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="כיתה חדשה"
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
        <TextField
          type="date"
          label="תאריך המעבר"
          value={switchDate}
          onChange={(e) => setSwitchDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button
          color="primary"
          variant="contained"
          disabled={!newKlassId || !switchDate}
          onClick={() => onConfirm({ id: row.id, newKlassId, switchDate })}
        >
          העבר
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StudentKlassesContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);
  const tableRef = useRef();
  const [switchDialogRow, setSwitchDialogRow] = useState(null);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  const handleOpenSwitchKlass = useCallback((rowData) => setSwitchDialogRow(rowData), []);
  const handleCloseSwitchKlass = useCallback(() => setSwitchDialogRow(null), []);
  const handleConfirmSwitchKlass = useCallback(
    (payload) => {
      dispatch(crudAction.customHttpRequest(entity, 'POST', 'switch-klass', payload)).then(() => {
        setSwitchDialogRow(null);
        tableRef.current && tableRef.current.onQueryChange();
      });
    },
    [dispatch, entity]
  );

  const actions = useMemo(
    () => getActions(handleOpenSwitchKlass, editData?.klasses, editData?.baseKlassTypeId),
    [handleOpenSwitchKlass, editData]
  );

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data', { year: defaultYear }));
  }, []);

  return (
    <>
      <Table
        entity={entity}
        title={title}
        columns={columns}
        filters={filters}
        additionalActions={actions}
        externalTableRef={tableRef}
      />
      <SwitchKlassDialog
        open={!!switchDialogRow}
        row={switchDialogRow}
        klasses={editData?.klasses}
        students={editData?.studentsByYear}
        onClose={handleCloseSwitchKlass}
        onConfirm={handleConfirmSwitchKlass}
      />
    </>
  );
};

export default StudentKlassesContainer;
