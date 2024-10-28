import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isExtraSmall = width < 576;
  const isSmall = width >= 576 && width < 768;
  const isMedium = width >= 768 && width < 992;
  const isLarge = width >= 992 && width < 1200;
  const isExtraLarge = width >= 1200;

  const getSpacing = (size) => {
    const baseSize = isExtraSmall ? 1 : 
                    isSmall ? 1.2 : 
                    isMedium ? 1.4 : 
                    isLarge ? 1.6 : 1.8;
    return size * baseSize;
  };

  const getFontSize = (size) => {
    const baseSize = isExtraSmall ? 1 : 
                    isSmall ? 1.1 : 
                    isMedium ? 1.2 : 
                    isLarge ? 1.3 : 1.4;
    return size * baseSize;
  };

  const styles = {
    container: {
      paddingHorizontal: getSpacing(16),
      paddingVertical: getSpacing(12),
    },
    text: {
      small: getFontSize(12),
      regular: getFontSize(14),
      medium: getFontSize(16),
      large: getFontSize(18),
      extraLarge: getFontSize(24),
    },
    spacing: {
      xs: getSpacing(4),
      sm: getSpacing(8),
      md: getSpacing(16),
      lg: getSpacing(24),
      xl: getSpacing(32),
    }
  };

  return {
    width,
    height,
    isExtraSmall,
    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
    getSpacing,
    getFontSize,
    styles,
  };
};