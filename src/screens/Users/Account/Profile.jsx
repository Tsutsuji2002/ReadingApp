import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../../../firebaseConfig';

const Profile = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { username, userRole, isLoggedIn, user } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor: theme.bg }]}>
        <Text style={[tw.textLg, { color: theme.text }]}>
            Vui lòng đăng nhập để xem hồ sơ của bạn.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={[tw.pY2, tw.pX4, tw.rounded, { backgroundColor: theme.primary }]}
        >
          <Text style={[tw.fontBold, { color: theme.extrabutton }]}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[tw.flex1, { backgroundColor: theme.bg }]}>
      <View style={[tw.itemsCenter, tw.mT6]}>
        <Image
          source={{ uri: profileData?.profile_picture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }}
          style={[tw.w24, tw.h24, tw.roundedFull, tw.mB4]}
        />
        <Text style={[tw.textXl, tw.fontBold, { color: theme.text }]}>{profileData?.username || 'User'}</Text>
        <Text style={[tw.textBase, { color: theme.mutedText }]}>
          {userRole === 'admin' ? 'Admin' : 'Reader'}
        </Text>

        <TouchableOpacity
          style={[tw.pY2, tw.pX6, tw.mT4, tw.rounded, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={[tw.fontBold, { color: theme.extrabutton }]}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={[tw.mT8, tw.pX4]}>
        <View style={[tw.flexRow, tw.justifyBetween]}>
          <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>Thống kê đọc</Text>
        </View>
        <View style={[tw.flexRow, tw.justifyBetween, tw.mT4]}>
          <View style={tw.itemsCenter}>
            <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>{profileData?.last_read_novels?.length || 0}</Text>
            <Text style={[tw.textSm, { color: theme.mutedText }]}>Sách đã đọc</Text>
          </View>
          <View style={tw.itemsCenter}>
            <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>5</Text>
            <Text style={[tw.textSm, { color: theme.mutedText }]}>Đang đọc</Text>
          </View>
          <View style={tw.itemsCenter}>
            <Text style={[tw.textLg, tw.fontBold, { color: theme.text }]}>3</Text>
            <Text style={[tw.textSm, { color: theme.mutedText }]}>Yêu thích</Text>
          </View>
        </View>
      </View>

      <View style={[tw.mT8, tw.pX4]}>
        <TouchableOpacity
          style={[tw.flexRow, tw.itemsCenter, tw.mB4, { backgroundColor: theme.comp, padding: 10, borderRadius: 10 }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings-outline" size={24} color={theme.text} style={tw.mR2} />
          <Text style={[tw.textBase, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[tw.flexRow, tw.itemsCenter, { backgroundColor: theme.comp, padding: 10, borderRadius: 10 }]}
          onPress={() => {
            auth.signOut();
            navigation.navigate('Login');
          }}
        >
          <Icon name="log-out-outline" size={24} color={theme.text} style={tw.mR2} />
          <Text style={[tw.textBase, { color: theme.text }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
