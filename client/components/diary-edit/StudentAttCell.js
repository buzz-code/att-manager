import React, { useCallback } from 'react';
// import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';

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

    return <Select
        native
        value={value}
        onChange={onChange}
        onBlur={onBlur}
    >
        <SelectOptions list={attTypes} />
    </Select>
    // return <Autocomplete
    //     size="small"
    //     className={className}
    //     options={attTypes || []}
    //     getOptionLabel={(option) => option.name}
    //     getOptionSelected={(option, value) => option.key == value}
    //     value={value}
    //     renderInput={(params) => {
    //         return <TextField {...params} fullWidth />;
    //     }}
    //     onChange={onChange}
    //     onBlur={onBlur}
    // />
}

const SelectOptions = React.memo(({ list }) => {
    return <>
        <option value='' />
        {list.map((item, i) => (
            <option key={i} value={item.key}>
                {item.name}
            </option>
        ))}
    </>
})

export default React.memo(StudentAttCell);