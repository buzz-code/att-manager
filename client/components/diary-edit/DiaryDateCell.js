import React, { useCallback } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
// import TextField from '@material-ui/core/TextField';

const DiaryDateCell = ({ value: initialValue, columnId, updateMyData, label, className }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = useCallback((e, val) => {
        setValue(val)
    }, [setValue]);

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(columnId, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
            size="small"
            margin="dense"
            className={className}
            label={label}
            format="dd/MM/yyyy"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    </MuiPickersUtilsProvider>
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