import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import StudentAttCell from './StudentAttCell';
import DiaryDateCell from './DiaryDateCell';

const useStyles = makeStyles((theme) => ({
    container: {
        marginBottom: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        overflowY: 'auto',
    },
    table: {
        borderCollapse: 'collapse',
        borderSpacing: 'auto',
        width: '100%',
        tableLayout: 'auto',
    },
    tableRow: {
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        '& th': {
            fontWeight: 500,
            lineHeight: '1.5rem',
            padding: theme.spacing(2),
            textAlign: 'left',
        },
        '& td': {
            padding: theme.spacing(2),
        },
    },
    inputField: {
        display: 'inline-flex',
        width: 100,
    },
    buttonContainer: {
        display: 'flex',
    },
}));

const DiaryTable = ({ diaryData }) => {
    const classes = useStyles();

    const lessons = React.useMemo(() => [...Array(diaryData.groupData.group.lesson_count)]
        .map((_, index) => `lesson_date_${index + 1}`),
        [diaryData.groupData.group.lesson_count]);
    const [data, setData] = React.useState(diaryData.groupData.students);
    const [dates, setDates] = React.useState({});

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

    return <>
        <div className={classes.container}>
            <table className={classes.table}>
                <TableHeader lessons={lessons} dates={dates} updateDates={updateDates} classes={classes} />
                <tbody>
                    {data.map((item, index) => (
                        <TableRow key={item.tz} item={item} index={index} lessons={lessons} attTypes={diaryData.attTypes} updateMyData={updateMyData} classes={classes} />
                    ))}
                </tbody>
            </table>
        </div>
    </>;
}

const TableHeader = React.memo(({ lessons, dates, updateDates, classes }) => {
    return <thead>
        <tr className={classes.tableRow}>
            <th> </th>
            <th>תז</th>
            <th>שם התלמידה</th>
            {lessons.map((item, index) => (
                <th key={item}>
                    {'תאריך ' + (index + 1)}
                    {/* <DiaryDateCell columnId={item} updateMyData={updateDates} value={dates[item]} label={'תאריך ' + (index + 1)} className={classes.inputField} /> */}
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