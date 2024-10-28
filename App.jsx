import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { ResponsiveProvider } from './src/context/ResponsiveContext';
import { AuthProvider } from './src/context/AuthContext';
import StackNavigator from './src/screens/Users/Navigator/StackNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/redux/store/store';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <ResponsiveProvider>
            <ThemeProvider>
              <NavigationContainer>
                <StackNavigator />
              </NavigationContainer>
            </ThemeProvider>
          </ResponsiveProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;