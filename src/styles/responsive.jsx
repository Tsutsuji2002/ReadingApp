import { StyleSheet } from 'react-native';

export const createResponsiveStyle = (styleFunction) => {
  return StyleSheet.create(styleFunction());
};