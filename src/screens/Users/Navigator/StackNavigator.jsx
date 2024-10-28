import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../../Accounts/LoginScreen';
import SignUpScreen from '../../Accounts/SignupScreen';
import { AppLayout } from '../../../components/layout/AppLayout';
import NewNovelScreen from '../Novel/NewNovelScreen';
import NovelDetailScreen from '../Novel/NovelDetailScreen';
import ChapterScreen from '../Novel/ChapterScreen';
import HomeScreen from '../Main/HomeScreen';
import AdminHomeScreen from '../../Admin/Main/AdminHomeScreen';
import NovelList from '../../Admin/Novel/NovelList';
import AccountManage from '../../Admin/Account/AccountManage';
import EditAccount from '../../Admin/Account/EditAccount';
import EditNovel from '../../Admin/Novel/EditNovel';
import Profile from '../Account/Profile';
import EditProfile from '../Account/EditProfile';
import AddChapterScreen from '../Novel/AddChapterScreen';
import MyNovelScreen from '../Novel/MyNovelScreen';
import ManageChaptersScreen from '../Novel/ManageChaptersScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <AppLayout>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
            name="Drawer" 
            component={DrawerNavigator} 
            options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="NewNovel" component={NewNovelScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen 
          name="NovelDetail" 
          component={NovelDetailScreen} 
          options={({ route }) => ({
            title: route.params?.novel?.title || 'Novel Detail',
            headerShown: false,
          })} 
        />
        <Stack.Screen 
          name="ChapterScreen" 
          component={ChapterScreen}
        />
        <Stack.Screen name="AddChapterScreen" component={AddChapterScreen} />
        <Stack.Screen name="MyNovelScreen" component={MyNovelScreen} />
        <Stack.Screen name="ManageChapters" component={ManageChaptersScreen} />

        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="NovelList" component={NovelList} />
        <Stack.Screen name="AccountManage" component={AccountManage} />
        <Stack.Screen name="EditNovel" component={EditNovel} />
        <Stack.Screen name="EditAccount" component={EditAccount} />
      </Stack.Navigator>
    </AppLayout>
  );
};

export default StackNavigator;
