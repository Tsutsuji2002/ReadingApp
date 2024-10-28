import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../../context/ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor: theme.screens }]}>
      <TouchableOpacity onPress={toggleTheme}>
        <Text style={[tw.textLg, { color: theme.text }]}>Toggle Light/Dark Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;
