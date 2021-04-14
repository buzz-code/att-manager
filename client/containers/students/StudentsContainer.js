import React, { useMemo } from 'react';

import Table from '../../components/table/Table';
import { STUDENTS } from '../../constants/entity';

const getColumns = () => [{ field: 'name', title: 'שם' }];

const StudentsContainer = () => {
  const title = 'תלמידות';
  const entity = STUDENTS;
  const columns = useMemo(() => getColumns(), []);

  return <Table entity={entity} title={title} columns={columns} />;
};

export default StudentsContainer;
