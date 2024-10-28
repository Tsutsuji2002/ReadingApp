import React, { useState, useContext, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Main/HomeScreen';
import MyFavoriteScreen from '../Novel/MyFavoriteScreen';
import PostNovelScreen from '../Novel/PostNovelScreen';
import { Header } from '../../../components/layout/Header';
import { ThemeContext } from '../../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { headerKey } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <Header key={headerKey} />,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.extracomp,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text + '80',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={MyFavoriteScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Yêu Thích'
        }}
      />
      <Tab.Screen 
        name="PostNovel" 
        component={PostNovelScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Đăng truyện',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;