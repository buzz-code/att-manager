import React, { useCallback } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

const StudentAttCell = ({ value: initialValue, index, columnId, updateMyData, attTypes, className }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = useCallback((e, val) => {
        setValue(val && val.key)
    }, [setValue]);

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(index, columnId, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <Autocomplete
        size="small"
        className={className}
        options={attTypes || []}
        getOptionLabel={(option) => option.name}
        getOptionSelected={(option, value) => option.key == value}
        value={value}
        renderInput={(params) => {
            return <TextField {...params} fullWidth />;
        }}
        onChange={onChange}
        onBlur={onBlur}
    />

}

export default StudentAttCell;