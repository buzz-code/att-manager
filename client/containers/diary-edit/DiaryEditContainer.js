import React, { useEffect, useMemo } from 'react';
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

  const isDiaryDataValid = useMemo(() => diaryData && diaryData.groupData.group.id == groupId, [diaryData, groupId]);

  return (
    <div>
      <h2 style={{ paddingBottom: '15px' }}>{title} {isDiaryDataValid && <>
        {diaryData.groupData.group.klass?.name} {diaryData.groupData.group.teacher?.name} {diaryData.groupData.group.lesson?.name}
      </>}</h2>

      {isLoading && <CircularProgress size={36} />}

      {isDiaryDataValid && <DiaryTable diaryData={diaryData} title={title} />}
    </div>
  );
};

export default DiaryEditContainer;