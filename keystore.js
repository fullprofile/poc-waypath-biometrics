import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

class AccessKeyStore {
  static isAuthenticated = false;

  __encode(value) {
    console.log('to encode: ', value);
    // Keystore does not allow saving special characters
    // Rule is Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
    const encoded = encodeURIComponent(value).replaceAll('%', '-.-_-.-');
    console.log('encoded: ', encoded);
    return encoded;
  }

  __decode(value) {
    console.log('to decode: ', value);
    // Keystore does not allow saving special characters
    // Rule is Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
    const decoded = decodeURIComponent(value.replaceAll('-.-_-.-', '%'));
    console.log('decoded: ', decoded);
    return decoded;
  }

  async __authenticate(showFallback = false) {
    // Check if hardware sensor is available
    const available = await LocalAuthentication.hasHardwareAsync();

    // Check if user have enrolled
    const hasKeys = await LocalAuthentication.isEnrolledAsync();

    if (available && hasKeys) {
      // Start authentication
      const {success} = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: showFallback && 'Use password',
      });

      this.authenticate(success);
    }
  }

  // Saving items that only requires the phone to be unlocked
  async save(key, value) {
    SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }

  // Saving items that requires user to authenticate using biometrics
  async saveBiometricsAuthenticated(key, value, options = {}) {
    const {authenticate, showFallback} = options;
    if (authenticate && !this.isAuthenticated) {
      await this.__authenticate(showFallback);
    }

    if (this.isAuthenticated) {
      const encodedKey = this.__encode(key);
      const encodedValue = this.__encode(value);

      console.log(encodedKey, 'key');
      SecureStore.setItemAsync(encodedKey, encodedValue, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  }

  // Retrieving values that only requires the phone to be unlocked
  async getValueForKey(key) {
    return SecureStore.getItemAsync(key, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }

  // Retrieving values that requires user to authenticate using biometrics
  async getValueForBiometrics(key, authenticate) {
    if (authenticate && !this.isAuthenticated) {
      await this.__authenticate();
    }

    if (this.isAuthenticated) {
      const encodedKey = this.__encode(key);
      const value = await SecureStore.getItemAsync(encodedKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      const decodedKey = key;
      const decodedValue = this.__decode(value);

      return {key: decodedKey, value: decodedValue};
    }

    return null;
  }

  async authenticate(authenticationnResult) {
    this.isAuthenticated = authenticationnResult;
  }
}

export default new AccessKeyStore();
