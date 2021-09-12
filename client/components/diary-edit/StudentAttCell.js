import React from 'react';

const StudentAttCell = ({ value: initialValue, row: { index }, column: { id }, updateMyData, attTypes }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <select value={value} onChange={onChange} onBlur={onBlur}>
        <option selected>---select---</option>
        {attTypes.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}
    </select>
}

export default StudentAttCell;