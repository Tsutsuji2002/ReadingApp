import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { getFirestore, doc, updateDoc } from '@firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfile = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { user, username, userRole, setUser } = useAuth();
  const [newUsername, setNewUsername] = useState(username || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [loading, setLoading] = useState(false);

  const db = getFirestore();

  const handleProfilePictureChange = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (!response.didCancel && !response.error) {
        setProfilePicture(response.assets[0]?.uri || profilePicture);
      }
    });
  };

  const saveProfile = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Validation Error', 'Username cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: newUsername,
        profile_picture: profilePicture,
      });
      setUser({ ...user, username: newUsername, profile_picture: profilePicture });

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw.flex1, tw.pX4, { backgroundColor: theme.bg }]}>
      <Text style={[tw.textXl, tw.fontBold, tw.mY4, { color: theme.text }]}>Edit Profile</Text>

      <View style={tw.itemsCenter}>
        <Image
          source={{ uri: profilePicture || 'https://example.com/default-avatar.png' }}
          style={[tw.w24, tw.h24, tw.roundedFull, tw.mB4]}
        />
        <TouchableOpacity
          onPress={handleProfilePictureChange}
          style={[tw.pY2, tw.pX4, tw.rounded, { backgroundColor: theme.primary }]}
        >
          <Text style={[tw.fontBold, { color: theme.extrabutton }]}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <View style={tw.mT6}>
        <Text style={[tw.textBase, { color: theme.text }]}>Username</Text>
        <TextInput
          value={newUsername}
          onChangeText={setNewUsername}
          style={[
            tw.pY2,
            tw.pX4,
            tw.rounded,
            { backgroundColor: theme.comp, color: theme.text, borderColor: theme.primary, borderWidth: 1 }
          ]}
          placeholder="Enter your username"
          placeholderTextColor={theme.mutedText}
        />
      </View>

      <TouchableOpacity
        onPress={saveProfile}
        style={[
          tw.pY2,
          tw.pX6,
          tw.mT8,
          tw.rounded,
          tw.itemsCenter,
          { backgroundColor: theme.primary }
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.extrabutton} />
        ) : (
          <Text style={[tw.fontBold, { color: theme.extrabutton }]}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          tw.pY2,
          tw.pX6,
          tw.mT4,
          tw.rounded,
          tw.itemsCenter,
          { backgroundColor: theme.comp }
        ]}
      >
        <Text style={[tw.fontBold, { color: theme.text }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfile;
