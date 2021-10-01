import React, { useCallback } from 'react';
// import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';

const StudentAttCell = ({ value, index, columnId, updateMyData, attTypes, className }) => {
    const onChange = useCallback((e) => {
        updateMyData(index, columnId, e.target.value)
    }, [updateMyData, index, columnId]);

    return <Select
        native
        className={className}
        value={value}
        onChange={onChange}
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