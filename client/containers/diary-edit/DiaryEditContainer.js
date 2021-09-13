import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as crudAction from '../../../common-modules/client/actions/crudAction';
import DiaryTable from '../../components/diary-edit/DiaryTable';

const title = 'יומן נוכחות';

const DiaryEditContainer = ({ entity }) => {
  const { groupId, diaryId } = useParams();

  const dispatch = useDispatch();
  const {
    isLoading,
    POST: { 'get-diary-data': diaryData },
  } = useSelector((state) => state[entity]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'POST', 'get-diary-data', { groupId: Number(groupId) }));
  }, [dispatch, entity, groupId]);

  return (
    <div>
      <h2 style={{ paddingBottom: '15px' }}>{title} {diaryData && <>
        {diaryData.groupData.group.klass?.name} {diaryData.groupData.group.teacher?.name} {diaryData.groupData.group.lesson?.name}
      </>}</h2>

      {isLoading && <CircularProgress size={36} />}

      {diaryData && <DiaryTable diaryData={diaryData} title={title} />}
    </div>
  );
};

export default DiaryEditContainer;