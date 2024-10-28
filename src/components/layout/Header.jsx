import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, TouchableWithoutFeedback } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { auth } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn, username, loading, userRole } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowMenu(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const closeMenu = () => {
    if (showMenu) setShowMenu(false);
  };

  // Add logging for debugging
  useEffect(() => {
  }, [isLoggedIn, username, userRole, loading]);

  if (loading) {
    return (
      <View style={[
        tw.flexRow, 
        tw.justifyBetween, 
        tw.itemsCenter, 
        tw.p4, 
        { backgroundColor: theme.comp }
      ]}>
        <View style={tw.w8} />
        <Text style={[tw.fontBold, tw.textXl, { color: theme.text }]}>Noveleaf</Text>
        <View style={tw.w8} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <View style={[
        tw.flexRow, 
        tw.justifyBetween, 
        tw.itemsCenter, 
        tw.p4, 
        { backgroundColor: theme.comp }
      ]}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={tw.p0}
        >
          <Icon name="menu-outline" size={30} color={theme.text} />
        </TouchableOpacity>

        <Text style={[
          tw.fontBold, 
          tw.textXl,
          { color: theme.text }
        ]}>
          {userRole === 'admin' ? 'Admin Dashboard' : 'Noveleaf'}
        </Text>

        {!isLoggedIn ? (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={[
              tw.pX4,
              tw.pY2,
              tw.rounded,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[tw.fontExtrabold, tw.textBase, { color: theme.extrabutton }]}>Đăng nhập</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity 
              onPress={toggleMenu} 
              style={tw.flexRow}
            >
              <Icon name="person-circle-outline" size={24} color={theme.text} />
              <Text style={[tw.textBase, tw.mL2, { color: theme.text }]}>
                {username || 'Profile'}
              </Text>
            </TouchableOpacity>

            {showMenu && (
              <TouchableOpacity 
                onPress={closeMenu}
                style={[
                  tw.absolute,
                  tw.topFull,
                  tw.right0,
                  tw.bgWhite,
                  tw.shadowLg,
                  tw.pY2,
                  { backgroundColor: theme.comp, zIndex: 10 }
                ]}
              >
                <TouchableOpacity
                  onPress={() => { 
                    navigation.navigate('Profile');
                    setShowMenu(false); 
                  }}
                  style={[tw.pY2, tw.pX4, tw.flexRow, tw.itemsCenter]}
                >
                  <Icon name="person-outline" size={20} color={theme.text} style={tw.mR2} />
                  <Text style={{ color: theme.text }}>Hồ sơ</Text>
                </TouchableOpacity>

                {userRole === 'admin' && (
                  <TouchableOpacity
                    onPress={() => { 
                      navigation.navigate('AdminDashboard');
                      setShowMenu(false); 
                    }}
                    style={[tw.pY2, tw.pX4, tw.flexRow, tw.itemsCenter]}
                  >
                    <Icon name="grid-outline" size={20} color={theme.text} style={tw.mR2} />
                    <Text style={{ color: theme.text }}>Dashboard</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => { 
                    navigation.navigate('MyNovelScreen');
                    setShowMenu(false); 
                  }}
                  style={[tw.pY2, tw.pX4, tw.flexRow, tw.itemsCenter]}
                >
                  <Icon name="book-outline" size={20} color={theme.text} style={tw.mR2} />
                  <Text style={{ color: theme.text }}>Kệ sách của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { 
                    navigation.navigate('Settings');
                    setShowMenu(false); 
                  }}
                  style={[tw.pY2, tw.pX4, tw.flexRow, tw.itemsCenter]}
                >
                  <Icon name="settings-outline" size={20} color={theme.text} style={tw.mR2} />
                  <Text style={{ color: theme.text }}>Cài đặt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  style={[tw.pY2, tw.pX4, tw.flexRow, tw.itemsCenter]}
                >
                  <Icon name="log-out-outline" size={20} color={theme.text} style={tw.mR2} />
                  <Text style={{ color: theme.text }}>Đăng xuất</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};