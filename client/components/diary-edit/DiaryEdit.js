import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as crudAction from '../../../common-modules/client/actions/crudAction';

import DiaryTableContainer from './DiaryTableContainer';

const title = 'יומן נוכחות';

const DiaryEdit = ({ group, entity }) => {
  const dispatch = useDispatch();
  const {
    POST: { 'get-diary-data': diaryData },
  } = useSelector((state) => state[entity]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'POST', 'get-diary-data', { id: group.id }));
  }, [group]);

  return (
    <div>
      <h2 style={{ paddingBottom: '15px' }}>עריכת יומנים</h2>

      {diaryData && <DiaryTableContainer diaryData={diaryData} title={title} />}

      <pre dir='ltr'>{JSON.stringify({ diaryData }, null, '  ')}</pre>
    </div>
  );
};

export default DiaryEdit;

// const columns = [
//     { key: "id", name: "ID", editable: true },
//     { key: "title", name: "Title", editable: true },
//     { key: "complete", name: "Complete", editable: true }
// ];

// const rows = [
//     { id: 0, title: "Task 1", complete: 20 },
//     { id: 1, title: "Task 2", complete: 40 },
//     { id: 2, title: "Task 3", complete: 60 }
// ];

// class Example extends React.Component {
//     state = { rows };

//     onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
//         this.setState(state => {
//             const rows = state.rows.slice();
//             for (let i = fromRow; i <= toRow; i++) {
//                 rows[i] = { ...rows[i], ...updated };
//             }
//             return { rows };
//         });
//     };
//     render() {
//         return (
//             <ReactDataGrid
//                 columns={columns}
//                 rowGetter={i => this.state.rows[i]}
//                 rowsCount={3}
//                 onGridRowsUpdated={this.onGridRowsUpdated}
//                 enableCellSelect={true}
//                 minWidth={150}
//                 minColumnWidth={50}
//             />
//         );
//     }
// }

// export default Example;




// const Compo = ()=>{
//     const data = React.useMemo(
//         () => [
//           {
//             col1: 'Hello',
//             col2: 'World',
//           },
//           {
//             col1: 'react-table',
//             col2: 'rocks',
//           },
//           {
//             col1: 'whatever',
//             col2: 'you want',
//           },
//         ],
//         []
//       )

//       const columns = React.useMemo(
//         () => [
//           {
//             Header: 'Column 1',
//             accessor: 'col1', // accessor is the "key" in the data
//           },
//           {
//             Header: 'Column 2',
//             accessor: 'col2',
//           },
//         ],
//         []
//       )

//       const tableInstance = useTable({ columns, data })

//       const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         rows,
//         prepareRow,
//       } = tableInstance
//       return (
//         // apply the table props
//         <table {...getTableProps()}>
//           <thead>
//             {// Loop over the header rows
//             headerGroups.map(headerGroup => (
//               // Apply the header row props
//               <tr {...headerGroup.getHeaderGroupProps()}>
//                 {// Loop over the headers in each row
//                 headerGroup.headers.map(column => (
//                   // Apply the header cell props
//                   <th {...column.getHeaderProps()}>
//                     {// Render the header
//                     column.render('Header')}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           {/* Apply the table body props */}
//           <tbody {...getTableBodyProps()}>
//             {// Loop over the table rows
//             rows.map(row => {
//               // Prepare the row for display
//               prepareRow(row)
//               return (
//                 // Apply the row props
//                 <tr {...row.getRowProps()}>
//                   {// Loop over the rows cells
//                   row.cells.map(cell => {
//                     // Apply the cell props
//                     return (
//                       <td {...cell.getCellProps()}>
//                         {// Render the cell contents
//                         cell.render('Cell')}
//                       </td>
//                     )
//                   })}
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       )
// }

// export default Compo