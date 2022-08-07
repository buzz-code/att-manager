import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { indigo } from '@material-ui/core/colors';
import { heIL } from '@material-ui/core/locale';
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';

import store, { history } from '../common-modules/client/store/configureStore';
import { verifyToken } from './../common-modules/client/services/tokenService';
import App from '../common-modules/client/containers/app/AppContainer';

const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const mountNode = document.getElementById('root');

const theme = createTheme(
  {
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: indigo,
    },
    direction: 'rtl',
  },
  heIL
);

// Used to log in if token is valid
store.dispatch(verifyToken());

ReactDOM.render(
  <Suspense fallback={<div>Error! Please refresh the page</div>}>
    <MuiThemeProvider theme={theme}>
      <StylesProvider jss={jss}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <App />
          </ConnectedRouter>
        </Provider>
      </StylesProvider>
    </MuiThemeProvider>
  </Suspense>,
  mountNode
);
