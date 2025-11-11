import React, { useCallback, useMemo } from 'react';
// import DateFnsUtils from '@date-io/date-fns';
// import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { ReactJewishDatePicker } from "react-jewish-datepicker";
import DeleteIcon from '@material-ui/icons/Delete';
import { formatDateOnly, parseDateOnly } from '../../../common-modules/client/utils/dateUtil';

const DiaryDateCell = ({ value, columnId, updateMyData, label, className, iconClassName }) => {
    
    const onChange = useCallback(({ date }) => {
        const dateString = formatDateOnly(date);
        updateMyData(columnId, dateString);
    }, [updateMyData, columnId]);

    const onClear = useCallback(() => {
        updateMyData(columnId, null);
    }, [updateMyData, columnId]);

    const dateValue = useMemo(() => {
        if (!value) return null;
        if (value instanceof Date) return value;
        
        // Try parsing as date string (YYYY-MM-DD)
        const parsed = parseDateOnly(value);
        if (parsed) return parsed;
        
        // Legacy: try parsing other string formats
        if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) return date;
        }
        
        return null;
    }, [value]);

    return <>
        {label}
        {'\u00A0'}
        <DeleteIcon className={iconClassName} onClick={onClear} />
        <ReactJewishDatePicker
            key={dateValue?.getTime() || 'empty'}
            className={className}
            value={dateValue}
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