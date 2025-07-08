/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity, Alert } from 'react-native';
import { isFeatureEnabled } from './src/config/featureFlags';
import { config, getEnvironment, isProduction } from './src/config/environment';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const currentEnv = getEnvironment();

  const handlePayment = () => {
    Alert.alert('Payment', 'Payment feature is enabled! This would integrate with payment gateway.');
  };

  const getEnvColor = () => {
    switch (currentEnv) {
      case 'production':
        return '#28a745';
      case 'staging':
        return '#007AFF';
      default:
        return '#ffc107';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Environment Badge */}
      <View style={[styles.envBadge, { backgroundColor: getEnvColor() }]}>
        <Text style={styles.envText}>{currentEnv.toUpperCase()}</Text>
      </View>
      
      <Text style={styles.welcomeText}>Welcome to Git Branching App!</Text>
      
      {/* Environment Info */}
      <View style={styles.envInfoSection}>
        <Text style={styles.sectionTitle}>Environment Configuration</Text>
        <Text style={styles.infoText}>API URL: {config.apiUrl}</Text>
        <Text style={styles.infoText}>Web URL: {config.webUrl}</Text>
      </View>
      
      {/* Feature Flag: Payment Integration */}
      {isFeatureEnabled('PAYMENT_INTEGRATION') && (
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Integration</Text>
          <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
            <Text style={styles.buttonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Feature Flag: Beta Features */}
      {isFeatureEnabled('BETA_FEATURES') && (
        <View style={styles.betaSection}>
          <Text style={styles.sectionTitle}>Beta Features</Text>
          <Text style={styles.betaText}>You have access to experimental features!</Text>
        </View>
      )}
      
      <NewAppScreen templateFileName="App.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  envBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 1,
  },
  envText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    color: '#333',
  },
  envInfoSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  paymentSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  betaSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  betaText: {
    fontSize: 14,
    color: '#e65100',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
