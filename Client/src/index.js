import React, {Suspense} from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { BrowserRouter as Router } from "react-router-dom";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Amplify } from "aws-amplify";
import Cookies from 'universal-cookie'
import OpenSansLight from './OpenSans-Light.ttf';
import './i18n';
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from './ReactAlertTemplate'

const cookies = new Cookies();
const role = cookies.get('role')
var primary_color="#881c1c"
if (role==='supporter'){
  primary_color="#003b5c"
}else if (role==='admin'){
  primary_color="#41273b"
}

const theme = createMuiTheme({
  typography: {
    fontFamily:{OpenSansLight},
    fontStyle: 'light',
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    //type: 'dark',
    primary: {
      main: primary_color,
    },
    secondary: {
      main: "#FFFFFF",
    }
  },
});

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: 'us-east-2',
    userPoolId: 'us-east-2_TOeWJwIy0',
    userPoolWebClientId: '7phnpqt6kfvfr9apoelke4hhm1'
  }
});

const AlertOptions = {
  position: positions.BOTTOM_CENTER,
  timeout: 3000,
  transition: transitions.FADE,
}

ReactDOM.render(
  <Router>
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <AlertProvider template={AlertTemplate} {...AlertOptions}>
          <Suspense fallback={null}>
            <App />
          </Suspense>
        </AlertProvider>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  </Router>,
  document.getElementById("root")
);
