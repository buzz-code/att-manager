import React from 'react';

import DiaryTable from './DiaryTable';
import StudentAttCell from './StudentAttCell';

const DiaryTableContainer = ({ diaryData }) => {
    const columns = React.useMemo(() => [
        {
            Header: 'יומן נוכחות', columns: [
                {
                    Header: 'תלמידה', columns: [
                        { Header: 'תז', accessor: 'tz', },
                        { Header: 'שם התלמידה', accessor: 'name', },
                    ],
                },
                {
                    Header: 'נוכחות', columns: [...new Array(diaryData.groupData.group.lesson_count)]
                        .map((_, index) => ({ Header: 'תאריך ' + (index + 1), accessor: 'date_' + (index + 1), Cell: StudentAttCell }))
                },
            ]
        }
    ], [diaryData.groupData.group.lesson_count])

    const [data, setData] = React.useState(diaryData.groupData.students)

    const updateMyData = (rowIndex, columnId, value) => {
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
    }

    return <DiaryTable columns={columns} data={data} updateMyData={updateMyData} attTypes={diaryData.attTypes} />;
}

export default DiaryTableContainer;