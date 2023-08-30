import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import custom components
import Dashboard from '../../components/dashboard/Dashboard';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { defaultYear } from '../../services/yearService';

const DashboardContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => state[entity]);

  const fetchData = (year) => dispatch(crudAction.fetchAll(entity, { year: year ?? defaultYear }));

  useEffect(() => {
    fetchData();
  }, []);

  return <Dashboard stats={data || {}} updateData={fetchData} />;
};

export default DashboardContainer;
