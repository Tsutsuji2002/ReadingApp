import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const AccountManage = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Fetch accounts from API
  }, []);

  const renderAccount = ({ item }) => (
    <TouchableOpacity 
      style={[tw.p2, tw.borderB, tw.borderGray300]} 
      onPress={() => navigation.navigate('EditAccount', { account: item })}
    >
      <Text style={[tw.fontBold]}>{item.username}</Text>
      <Text>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[tw.flex1]}>
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default AccountManage;