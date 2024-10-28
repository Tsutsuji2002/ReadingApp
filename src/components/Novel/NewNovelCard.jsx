import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { useResponsiveContext } from '../../context/ResponsiveContext';
import { ThemeContext } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Placeholder from '../../../assets/placeholder300x450.png'

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const NewNovelCard = ({ book, onPress, customWidth }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useResponsiveContext();
  
  const cardWidth = customWidth || width / 3.2;
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
      <View>
        <Image
          source={{ uri: book.cover_url } || { uri: Placeholder }}
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
        
        <View style={[
          tw.absolute,
          tw.top0,
          tw.right0,
          tw.m2,
          tw.roundedFull,
          tw.pX2,
          tw.pY1,
          {
            backgroundColor: theme.primary,
          }
        ]}>
          <Text style={[tw.textBase, { color: '#FFFFFF' }]}>MỚI</Text>
        </View>

        <View style={[
          tw.absolute,
          tw.bottom0,
          tw.left0,
          tw.m2,
          tw.roundedFull,
          tw.flexRow,
          tw.itemsCenter,
          tw.pX2,
          tw.pY1,
          {
            backgroundColor: 'rgba(0,0,0,0.7)',
          }
        ]}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={[tw.textXs, tw.mL1, { color: '#FFFFFF' }]}>
            {book.rating || '4.5'}
          </Text>
        </View>
      </View>

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

        <View style={[tw.flexRow, tw.flexWrap, tw.mT1]}>
          {(book.genres || []).slice(0, 2).map((genre, index) => (
            <View 
              key={index}
              style={[
                tw.roundedFull,
                tw.mR1,
                tw.mB1,
                tw.pX2,
                tw.pY1,
                {
                  backgroundColor: theme.extracomp + '40',
                }
              ]}
            >
              <Text 
                style={[
                  tw.textXs,
                  { color: theme.text + 'CC' }
                ]}
              >
                {genre}
              </Text>
            </View>
          ))}
        </View>

        <Text 
          style={[
            tw.textXs,
            tw.mT2,
            { color: theme.text + '99' }
          ]}
        >
          Ra mắt: {book.created_at}
        </Text>
      </View>
    </TouchableOpacity>
  );
};