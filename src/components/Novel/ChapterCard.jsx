import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { useResponsiveContext } from '../../context/ResponsiveContext';
import { ThemeContext } from '../../context/ThemeContext';

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const ChapterCard = ({ book, onPress }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useResponsiveContext();
  
  const cardWidth = width / 3.2;
  const imageHeight = cardWidth * 1.5;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw.m2,
        tw.rounded,
        {
          width: cardWidth,
          backgroundColor: theme.comp,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
      ]}
    >
      <Image
        source={{ uri: book.coverImage }}
        style={[
          tw.roundedT,
          {
            width: '100%',
            height: imageHeight,
            backgroundColor: theme.extracomp,
          }
        ]}
        resizeMode="cover"
      />

      <View style={[tw.p3]}>
        <Text 
          style={[
            tw.fontBold,
            tw.textBase,
            { color: theme.text, marginBottom: 4 }
          ]}
          numberOfLines={1}
        >
          {truncateText(book.title, 20)}
        </Text>

        <Text 
          style={[
            tw.textSm,
            { 
              color: theme.text + '99', // Adding opacity
              marginBottom: 2
            }
          ]}
          numberOfLines={1}
        >
          {book.chapnum}: {truncateText(book.latestChapter, 25)}
        </Text>

        <View 
          style={[
            tw.flexRow,
            tw.itemsCenter,
            tw.mT1,
            {
              backgroundColor: theme.extracomp + '40',
              padding: 4,
              borderRadius: 4
            }
          ]}
        >
          <View 
            style={[
              {
                height: 2,
                backgroundColor: theme.primary,
                width: `${book.progress || 0}%`,
                borderRadius: 1
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default ChapterCard;
