import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { tw } from 'react-native-tailwindcss';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from '@firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from '@firebase/firestore';
import { config } from '../../../firebaseConfig';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { forceHeaderUpdate, setUserRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: config.androidClientId,
    scopes: ['profile', 'email'],
  });

  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication);
    }
  }, [response]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in user:', user);
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userRole = userDoc.data().role;
      setUserRole(userRole);
  
      forceHeaderUpdate();
  
      if (userRole === 'admin') {
        navigation.navigate('AdminHome');
      } else {
        navigation.navigate('Drawer', { screen: 'Trang chủ' });
      }

    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };
  

  const handleGoogleSignIn = async (authentication) => {
    try {
      const credential = GoogleAuthProvider.credential(authentication.id_token);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      await saveUserToFirestore(user);
      navigation.navigate('HomeScreen');
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.message);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
        clientId: config.facebookClientId,
        scopes: ['public_profile', 'email'],
      });

      if (fbResponse?.type === 'success') {
        const credential = FacebookAuthProvider.credential(fbResponse.accessToken);
        const result = await signInWithCredential(auth, credential);
        const user = result.user;
        await saveUserToFirestore(user);
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      Alert.alert('Facebook Sign-In Error', error.message);
    }
  };

  const saveUserToFirestore = async (user) => {
    try {
      await setDoc(doc(firestore, `users/${user.uid}`), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const toggleRememberPassword = () => {
    setRememberPassword(!rememberPassword);
  };

  return (
    <View style={[tw.flex1, tw.justifyCenter, tw.pX4, tw.bgIndigo200]}>
      <Text style={[tw.text3xl, tw.textCenter, tw.mB4, tw.textIndigo900, tw.fontExtrabold]}>Đăng nhập</Text>

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

      <TouchableOpacity
        style={[tw.flexRow, tw.itemsCenter, tw.mB4]}
        onPress={toggleRememberPassword}
      >
        <View style={[tw.h5, tw.w5, tw.border, tw.rounded, tw.mR2, rememberPassword ? tw.bgBlue500 : tw.bgWhite, tw.borderGray300, tw.justifyCenter, tw.itemsCenter]}>
          {rememberPassword && <MaterialIcons name="check" size={16} color="white" />}
        </View>
        <Text style={tw.textGray700}>Ghi nhớ mật khẩu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[tw.bgBlue500, tw.p3, tw.rounded, tw.itemsCenter, tw.mB4]}
        onPress={handleLogin}
      >
        <Text style={[tw.textWhite, tw.textBase]}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[tw.textBlue500, tw.textCenter, tw.mB4]}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <View style={[tw.flexRow, tw.itemsCenter, tw.mY5]}>
        <View style={[tw.flex1, tw.borderB, tw.borderGray300]} />
        <Text style={[tw.mX3, tw.textGray700]}>Hoặc</Text>
        <View style={[tw.flex1, tw.borderB, tw.borderGray300]} />
      </View>

      <TouchableOpacity
        style={[tw.bgRed500, tw.pY3, tw.rounded, tw.flexRow, tw.itemsCenter, tw.mB4, tw.wFull]}
        onPress={() => promptAsync()}
      >
        <MaterialCommunityIcons name="google" size={20} color="white" style={tw.mL2} />
        <Text style={[tw.textWhite, tw.flex1, tw.textCenter, tw.mR8]}>Đăng nhập với Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[tw.bgBlue700, tw.pY3, tw.rounded, tw.flexRow, tw.itemsCenter, tw.mB4, tw.wFull]}
        onPress={handleFacebookSignIn}
      >
        <MaterialCommunityIcons name="facebook" size={20} color="white" style={tw.mL2} />
        <Text style={[tw.textWhite, tw.flex1, tw.textCenter, tw.mR8]}>Đăng nhập với Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={[tw.textGray700, tw.textCenter, tw.mT3]}>
          Chưa có tài khoản?{' '}
          <Text style={[tw.textBlue500]}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
