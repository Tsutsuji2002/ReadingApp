import React, { useContext} from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../Settings/SettingsScreen';
import { ThemeContext } from '../../../context/ThemeContext';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <Drawer.Navigator screenOptions={{
            drawerStyle: {
                backgroundColor: theme.screens,
            },
            drawerActiveBackgroundColor: theme.buttons,
            drawerActiveTintColor: theme.buttonstext,
            drawerInactiveTintColor: theme.text,
            headerShown: false
        }}>
        <Drawer.Screen name="Trang chủ" component={TabNavigator} />
        <Drawer.Screen name="Cài đặt" component={SettingsScreen} />
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
