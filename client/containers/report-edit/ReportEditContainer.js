import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import custom components
import ReportEdit from '../../components/report-edit/ReportEdit';
import { REPORT_EDIT as entity } from '../../constants/entity';
import { REPORT_EDIT as title } from '../../constants/entity-title';
import * as crudAction from '../../actions/crudAction';

const ReportEditContainer = () => {
  const dispatch = useDispatch();
  const {
    data,
    GET: { 'get-edit-data': editData },
    POST: { 'get-report-results': reportResults },
    error,
  } = useSelector((state) => state[entity]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
    // dispatch(crudAction.fetchAll(entity, {}));
  }, []);

  const handlePreviewClick = (columns) => {
    dispatch(crudAction.customHttpRequest(entity, 'POST', 'get-report-results', columns));
  };

  return (
    <ReportEdit
      tables={editData}
      onPreviewClick={handlePreviewClick}
      reportResults={reportResults}
    />
  );
};

export default ReportEditContainer;