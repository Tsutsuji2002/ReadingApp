import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, useWindowDimensions, StyleSheet } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecentlyReadList from '../../../components/Novel/RecentlyReadList';
import NewNovelList from '../../../components/Novel/NewNovelList';
import { ThemeContext } from '../../../context/ThemeContext';
import { useResponsiveContext } from '../../../context/ResponsiveContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState('');

  const responsiveStyles = useResponsiveContext();

  return (
    <View style={[tw.flex1, { backgroundColor: theme.screens }]}>
      
      <View style={[
        tw.m4,
        responsiveStyles.searchContainer,
        { backgroundColor: theme.extracomp }
      ]}>
        {/* <View style={[
          tw.flexRow,
          tw.itemsCenter,
          tw.p2,
          tw.rounded
        ]}>
          <TextInput
            style={[
              tw.flex1,
              tw.textBase,
              tw.mR2,
              { color: theme.text }
            ]}
            placeholder="Nhập tên truyện..."
            placeholderTextColor={theme.text}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => {}}>
            <Icon name="search-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView 
        style={tw.flex1}
        contentContainerStyle={tw.pB4}
      >
        <RecentlyReadList />
        <NewNovelList />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;