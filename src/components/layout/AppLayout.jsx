import React, {useContext} from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useResponsiveContext } from '../../context/ResponsiveContext';
import { ThemeContext } from '../../context/ThemeContext';

export const AppLayout = ({ children }) => {
  const { width, height } = useResponsiveContext();
  const { theme } = useContext(ThemeContext);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.screens,
    },
    container: {
      flex: 1,
      marginTop: Platform.select({
        ios: height * 0.01,
        android: height * 0.005 + StatusBar.currentHeight,
      }),
      backgroundColor: theme.screens,
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
};