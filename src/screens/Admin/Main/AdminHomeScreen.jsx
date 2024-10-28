import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';

const AdminHomeScreen = ({ navigation }) => {
  return (
    <View style={[tw.flex1, tw.p4]}>
      <Text style={[tw.text2xl, tw.fontBold, tw.mB4]}>Admin Dashboard</Text>
      <TouchableOpacity 
        style={[tw.flexRow, tw.itemsCenter, tw.mB4]} 
        onPress={() => navigation.navigate('NovelList')}
      >
        <Icon name="book-outline" size={24} />
        <Text style={[tw.mL2]}>Quản lý tiểu thuyết</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[tw.flexRow, tw.itemsCenter, tw.mB4]} 
        onPress={() => navigation.navigate('AccountManage')}
      >
        <Icon name="people-outline" size={24} />
        <Text style={[tw.mL2]}>Manage Accounts</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminHomeScreen;