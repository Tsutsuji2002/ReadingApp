import { initializeApp } from '@firebase/app';
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDLNOoQIlb4ln7ZiG1eVlRmZGwferoVg-s",
  authDomain: "final-f7347.firebaseapp.com",
  projectId: "final-f7347",
  storageBucket: "final-f7347.appspot.com",
  messagingSenderId: "752969770405",
  appId: "1:752969770405:android:8a2ee792dcfa82c320344c",
  measurementId: "9806190330",
  androidClientId: "752969770405-d0g20muh3n87ja7agc13q3gbcdb1otgt.apps.googleusercontent.com",
  webClientId: "752969770405-ub2br5hot898enn5k9sm1cabdtil4gsp.apps.googleusercontent.com"
};

export const config = {
  androidClientId: "752969770405-d0g20muh3n87ja7agc13q3gbcdb1otgt.apps.googleusercontent.com",
  webClientId: "752969770405-ub2br5hot898enn5k9sm1cabdtil4gsp.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});