import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
} from 'react-native';
import {Header} from 'react-native/Libraries/NewAppScreen';
import keyStore from './keystore';

/**
 * Process for enabling biometrics login
 * 1. User is required to login to the app once
 * 2. When user is logged in, the user will then go to the settings screen
 * 3. On settings screen a menu for enabling biometrics login is displayed
 * 4. User taps on the menu and will be prompted with biometrics if biometrics is enabled
 * 5. Otherwise an alert will be displayed describing the user needs to enroll and enable biometrics
 * 6. Once user authenticated using biometrics, the email and password are then saved on secure key store that
 *    will only be available for retrieval using biometrics
 */

const keyStoreKey = 'reden.sanchez+tc@agridigital.io';
const keyStoreValue = {password: 'qQ1!', organisation: 'Main'};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [value, setValue] = useState();

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Header />
        <Button
          onPress={() => {
            keyStore.saveBiometricsAuthenticated(
              keyStoreKey,
              JSON.stringify(keyStoreValue),
              {
                authenticate: true,
                showFallback: false,
              },
            );
          }}
          title="Enable Biometrics Login"
        />

        <Button
          onPress={async () => {
            const keyValue = await keyStore.getValueForBiometrics(keyStoreKey, {
              authenticate: true,
              showFallback: false,
            });
            setValue(keyValue);
          }}
          title={`Check key ${keyStoreKey}`}
        />
        <Text>{JSON.stringify(value)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
