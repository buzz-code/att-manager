import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import StudentAttCell from './StudentAttCell';
import DiaryDateCell from './DiaryDateCell';
import DiaryCheckboxCell from './DiaryCheckboxCell';

const useStyles = makeStyles((theme) => ({
    container: {
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        overflowY: 'auto',
        height: 'calc(100vh - 204px)',
    },
    table: {
        borderCollapse: 'collapse',
        borderSpacing: 'auto',
        width: '100%',
        tableLayout: 'auto',
    },
    tableRow: {
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        '&:hover': {
            background: theme.palette.grey[200],
        },
        '& th': {
            fontWeight: 500,
            lineHeight: '1rem',
            padding: '4px',
            textAlign: 'left',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            background: theme.palette.background.paper,
        },
        '& td': {
            padding: '2px 4px',
            fontSize: '12px',
        },
    },
    checkboxField: {
        margin: 0,
        '& .MuiCheckbox-root': {
            padding: 0,
        },
        '& .MuiFormControlLabel-label': {
            fontSize: '12px',
        },
    },
    dateField: {
        '& .selectedDate': {
            width: 79,
            fontSize: 10,
            padding: 1,
            lineHeight: '1rem',
            minHeight: theme.spacing(2)
        }
    },
    inputField: {
        display: 'inline-flex',
        width: 79,
        fontSize: '12px',
    },
    clearDateIcon: {
        cursor: 'pointer',
        fontSize: '1rem',
    },
    buttonContainer: {
        display: 'flex',
    },
}));

const DiaryTable = ({ diaryData, handleSave }) => {
    const classes = useStyles();

    const lessons = diaryData.groupData.lessons;
    const [data, setData] = React.useState(diaryData.groupData.students);
    const [dates, setDates] = React.useState(diaryData.groupData.dates || {});
    const [isSubstitute, setIsSubstitute] = React.useState(diaryData.groupData.isSubstitute || {});

    const updateMyData = React.useCallback((rowIndex, columnId, value) => {
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        )
    }, [setData]);
    const updateDates = React.useCallback((columnId, value) => {
        setDates(old => ({ ...old, [columnId]: value }));
    }, [setDates]);
    const updateIsSubstitute = React.useCallback((columnId, value) => {
        setIsSubstitute(old => ({ ...old, [columnId]: value }));
    }, [setIsSubstitute]);
    const saveData = () => {
        handleSave(data, dates, lessons, isSubstitute);
    }

    return <>
        <div className={classes.buttonContainer} style={{ marginBottom: 16 }}>
            <div style={{ flex: '1' }}> </div>
            <Button variant="contained" color="primary" onClick={saveData}>
                שמור
            </Button>
        </div>

        <div className={classes.container}>
            <table className={classes.table}>
                <TableHeader lessons={lessons} dates={dates} updateDates={updateDates} isSubstitute={isSubstitute} updateIsSubstitute={updateIsSubstitute} classes={classes} />
                <tbody>
                    {data.map((item, index) => (
                        <TableRow key={item.tz} item={item} index={index} lessons={lessons} attTypes={diaryData.attTypes} updateMyData={updateMyData} classes={classes} />
                    ))}
                </tbody>
            </table>
        </div>
    </>;
}

const TableHeader = React.memo(({ lessons, dates, updateDates, isSubstitute, updateIsSubstitute, classes }) => {
    return <thead>
        <tr className={classes.tableRow}>
            <th> </th>
            <th>תז</th>
            <th>שם התלמידה</th>
            {lessons.map((item, index) => (
                <th key={item}>
                    <DiaryDateCell columnId={item} updateMyData={updateDates} value={dates[item]} label={'שיעור ' + (index + 1)} className={classes.dateField} iconClassName={classes.clearDateIcon} />
                    <DiaryCheckboxCell columnId={item} updateMyData={updateIsSubstitute} value={isSubstitute[item]} className={classes.checkboxField} />
                </th>
            ))}
        </tr>
    </thead>
});

const TableRow = React.memo(({ item, index, lessons, attTypes, updateMyData, classes }) => {
    return <tr className={classes.tableRow}>
        <td>{index + 1}</td>
        <td>{item.tz}</td>
        <td>{item.name}</td>
        {lessons.map((lesson) => (
            <td key={index + lesson}>
                <StudentAttCell index={index} columnId={lesson} updateMyData={updateMyData} value={item[lesson]} attTypes={attTypes} className={classes.inputField} />
            </td>
        ))}
    </tr>

});

export default React.memo(DiaryTable);