/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity, Alert } from 'react-native';
import { isFeatureEnabled } from './src/config/featureFlags';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const handlePayment = () => {
    Alert.alert('Payment', 'Payment feature is enabled! This would integrate with payment gateway.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text style={styles.welcomeText}>Welcome to Git Branching App!</Text>
      
      {/* Feature Flag: Payment Integration */}
      {isFeatureEnabled('PAYMENT_INTEGRATION') && (
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Integration</Text>
          <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
            <Text style={styles.buttonText}>Pay Now</Text>
          </TouchableOpacity>
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    color: '#333',
  },
  paymentSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
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
