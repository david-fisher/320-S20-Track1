/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Amplify} from 'aws-amplify';

AppRegistry.registerComponent(appName, () => App);

Amplify.configure({
    Auth: {
      mandatorySignIn: true,
      region: 'us-east-2',
      userPoolId: 'us-east-2_TOeWJwIy0',
      userPoolWebClientId: '7phnpqt6kfvfr9apoelke4hhm1'
    }
  });