import React, { useCallback } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const DiaryCheckboxCell = ({ value, columnId, updateMyData, className }) => {
    const onChange = useCallback(({ target: { checked } }) => {
        updateMyData(columnId, checked);
    }, [updateMyData, columnId]);

    if (typeof value !== 'boolean') {
        value = value == 1;
    }

    return <>
        <FormControlLabel
            classes={{ root: className }}
            control={
                <Checkbox
                    color="primary"
                    size="small"
                    checked={value}
                    onChange={onChange}
                />
            }
            label={'ממלאת מקום'}
        />
    </>
}

export default React.memo(DiaryCheckboxCell);