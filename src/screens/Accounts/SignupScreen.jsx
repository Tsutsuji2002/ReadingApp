import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from '@firebase/auth';
import { doc, setDoc } from '@firebase/firestore';
import { auth, db } from '../../../firebaseConfig';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await saveUserToFirestore(user, name, 'user');
      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserToFirestore(user);
      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Google Sign-Up Error', error.message);
    }
  };

  const handleFacebookSignUp = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserToFirestore(user);
      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Facebook Sign-Up Error', error.message);
    }
  };

  const saveUserToFirestore = async (user, displayName = '', role) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: displayName || user.displayName || '',
        profile_picture: user.photoURL || '',
        joined_date: new Date(),
        last_read_novels: [],
        role: role,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <View style={[tw.flex1, tw.justifyCenter, tw.pX6, tw.bgIndigo200]}>
      <Text style={[tw.text3xl, tw.textCenter, tw.mB5, tw.textIndigo900, tw.fontExtrabold]}>Đăng ký</Text>

      <TextInput
        placeholder="Tên"
        style={[tw.border, tw.p3, tw.rounded, tw.mB3, tw.borderGray300, tw.bgWhite]}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={[tw.border, tw.p3, tw.rounded, tw.mB3, tw.borderGray300, tw.bgWhite]}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={[tw.flexRow, tw.itemsCenter, tw.border, tw.rounded, tw.mB4, tw.borderGray300, tw.bgWhite]}>
        <TextInput
          placeholder="Mật khẩu"
          style={[tw.flex1, tw.pY3, tw.pX4]}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={tw.pX3}>
          <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <View style={[tw.flexRow, tw.itemsCenter, tw.border, tw.rounded, tw.mB5, tw.borderGray300, tw.bgWhite]}>
        <TextInput
          placeholder="Xác nhận mật khẩu"
          style={[tw.flex1, tw.pY3, tw.pX4]}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={tw.pX3}>
          <MaterialCommunityIcons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[tw.bgBlue500, tw.p3, tw.rounded, tw.itemsCenter, tw.mB4]}
        onPress={handleSignUp}
      >
        <Text style={[tw.textWhite, tw.textBase]}>Đăng ký</Text>
      </TouchableOpacity>

      <View style={[tw.flexRow, tw.itemsCenter, tw.mY5]}>
        <View style={[tw.flex1, tw.borderB, tw.borderGray300]} />
        <Text style={[tw.mX3, tw.textBlue700]}>Hoặc</Text>
        <View style={[tw.flex1, tw.borderB, tw.borderGray300]} />
      </View>

      <TouchableOpacity
        style={[tw.bgRed500, tw.pY3, tw.rounded, tw.flexRow, tw.itemsCenter, tw.mB4, tw.wFull]}
        onPress={handleGoogleSignUp}
      >
        <MaterialCommunityIcons name="google" size={20} color="white" style={tw.mL2} />
        <Text style={[tw.textWhite, tw.flex1, tw.textCenter, tw.mR8]}>Đăng ký với Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[tw.bgBlue700, tw.pY3, tw.rounded, tw.flexRow, tw.itemsCenter, tw.mB4, tw.wFull]}
        onPress={handleFacebookSignUp}
      >
        <MaterialCommunityIcons name="facebook" size={20} color="white" style={tw.mL2} />
        <Text style={[tw.textWhite, tw.flex1, tw.textCenter, tw.mR8]}>Đăng ký với Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[tw.textGray700, tw.textCenter, tw.mT4]}>
          Đã có tài khoản?{' '}
          <Text style={[tw.textBlue500]}>Đăng nhập</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}