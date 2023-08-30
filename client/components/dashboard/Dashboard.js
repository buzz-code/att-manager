import React, { useMemo, useState } from 'react';
import { cyan, pink, purple, orange } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import ListAltIcon from '@material-ui/icons/ListAlt';
import PeopleIcon from '@material-ui/icons/People';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import SummaryBox from '../../../common-modules/client/components/common/summary-box/SummaryBox';
import { defaultYear, yearsList, updateDefaultYear } from '../../services/yearService';

const statItems = [
  // { id: 'reports', text: 'צפיות', icon: ListAltIcon, color: pink[600], value: 0 },
  { id: 'students5782', text: 'תלמידות תשפ"ב', icon: PeopleIcon, color: cyan[600], value: 0 },
  { id: 'students5783', text: 'תלמידות תשפ"ג', icon: PeopleIcon, color: cyan[600], value: 0 },
  { id: 'students5784', text: 'תלמידות תשפ"ד', icon: PeopleIcon, color: cyan[600], value: 0 },
  { id: 'teachers', text: 'מורות', icon: SupervisedUserCircleIcon, color: purple[600], value: 0 },
];

const Dashboard = ({ stats }) => {
  const dashboardItems = useMemo(
    () => statItems.map((item) => ({ ...item, value: stats[item.id] })),
    [stats]
  );

  const [year, setYear] = useState(defaultYear);
  const handleYearChange = (e) => {
    setYear(e.target.value);
    updateDefaultYear(e.target.value);
  }

  return (
    <div>
      <h2 style={{ paddingBottom: '15px' }}>לוח הבקרה</h2>

      <Grid container spacing={4} style={{ marginBottom: '15px' }}>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <Card>
            <CardContent>
              <FormControl>
                <InputLabel id='year-selector'>שנה</InputLabel>
                <Select labelId='year-selector' value={year} label='שנה' onChange={handleYearChange}        >
                  {yearsList.map(item => (
                    <MenuItem value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} style={{ marginBottom: '15px' }}>
        {dashboardItems.map((item) => (
          <Grid key={item.id} item lg={3} sm={6} xl={3} xs={12}>
            <SummaryBox
              Icon={item.icon}
              color={item.color}
              title={item.text}
              value={String(item.value)}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
