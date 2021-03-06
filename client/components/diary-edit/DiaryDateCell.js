import React, { useCallback } from 'react';
// import DateFnsUtils from '@date-io/date-fns';
// import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { ReactJewishDatePicker } from "react-jewish-datepicker";
import DeleteIcon from '@material-ui/icons/Delete';

const DiaryDateCell = ({ value, columnId, updateMyData, label, className, iconClassName }) => {
    const onChange = useCallback(({ date }) => {
        updateMyData(columnId, date);
    }, [updateMyData, columnId]);

    const onClear = useCallback(() => {
        updateMyData(columnId, null);
    }, [updateMyData, columnId]);

    if (typeof (value) == 'string') {
        value = new Date(value);
    }

    return <>
        {label}
        {'\u00A0'}
        <DeleteIcon className={iconClassName} onClick={onClear} />
        <ReactJewishDatePicker
            key={value}
            className={className}
            value={value}
            isHebrew
            onClick={onChange}
        />
    </>

    // return <MuiPickersUtilsProvider utils={DateFnsUtils}>
    //     <KeyboardDatePicker
    //         size="small"
    //         margin="dense"
    //         className={className}
    //         label={label}
    //         format="dd/MM/yyyy"
    //         value={value}
    //         onChange={onChange}
    //         onBlur={onBlur}
    //     />
    // </MuiPickersUtilsProvider>
    {/* <Autocomplete
        size="small"
        getOptionLabel={(option) => option.name}
        getOptionSelected={(option, value) => option.key == value}
        value={value}
        renderInput={(params) => {
            return <TextField {...params} fullWidth />;
        }}
        onChange={onChange}
        onBlur={onBlur}
    /> */}
}

export default React.memo(DiaryDateCell);