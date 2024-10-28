import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const EditAccount = ({ route, navigation }) => {
  const { account } = route.params;
  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email);

  const handleSave = () => {
    // Save changes to API
    navigation.goBack();
  };

  return (
    <View style={[tw.flex1, tw.p4]}>
      <Text style={[tw.text2xl, tw.fontBold, tw.mb4]}>Edit Account</Text>
      <TextInput
        style={[tw.border, tw.p2, tw.mb4]}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <TextInput
        style={[tw.border, tw.p2, tw.mb4]}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TouchableOpacity 
        style={[tw.bgBlue500, tw.p2, tw.roundedLg]} 
        onPress={handleSave}
      >
        <Text style={[tw.textWhite, tw.textCenter]}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditAccount;