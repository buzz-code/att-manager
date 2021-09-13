import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import StudentAttCell from './StudentAttCell';

const useStyles = makeStyles((theme) => ({
    container: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
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
        },
    },
    inputField: {
        margin: theme.spacing(1),
        display: 'inline-flex',
        width: 80,
    },
    buttonContainer: {
        display: 'flex',
    },
}));

const DiaryTableContainer = ({ diaryData, title }) => {
    const classes = useStyles();

    const diaryTitle = React.useMemo(() => `${title} ${diaryData.groupData.group.klass?.name} ${diaryData.groupData.group.teacher?.name} ${diaryData.groupData.group.lesson?.name}`, [title, diaryData]);
    const lessons = React.useMemo(() => [...Array(diaryData.groupData.group.lesson_count)]
        .map((_, index) => `lesson_date_${index + 1}`),
        [diaryData.groupData.group.lesson_count]);
    const [data, setData] = React.useState(diaryData.groupData.students);

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

    return <>
        {diaryTitle}
        <div className={classes.container}>
            <table className={classes.table}>
                <thead>
                    <tr className={classes.tableRow}>
                        <th> </th>
                        <th>תז</th>
                        <th>שם התלמידה</th>
                        {lessons.map((_, index) => (
                            <th key={index}>תאריך {index + 1}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {diaryData.groupData.students.map((item, index) => (
                        <tr key={item.tz} className={classes.tableRow}>
                            <td>{index + 1}</td>
                            <td>{item.tz}</td>
                            <td>{item.name}</td>
                            {lessons.map((item) => (
                                <td>
                                    <StudentAttCell key={index + item} index={index} columnId={item} updateMyData={updateMyData} value={data[item]} attTypes={diaryData.attTypes} className={classes.inputField} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>;
}

export default DiaryTableContainer;