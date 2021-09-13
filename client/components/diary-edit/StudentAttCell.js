import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    inputField: {
        margin: theme.spacing(1),
        display: 'inline-flex',
        width: 100,
    },
}));

const StudentAttCell = ({ value: initialValue, row: { index }, column: { id }, updateMyData, attTypes }) => {
    const classes = useStyles();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = (e, val) => {
        setValue(val && val.key)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <Autocomplete
        size="small"
        className={classes.inputField}
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