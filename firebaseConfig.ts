import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Auth, Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyA8Il1zTFrp0LE_mIY65uErrLnVUBa_xVE',
  authDomain: 'brasiguaios-a9ddf.firebaseapp.com',
  projectId: 'brasiguaios-a9ddf',
  storageBucket: 'brasiguaios-a9ddf.firebasestorage.app',
  messagingSenderId: '138400859730',
  appId: '1:138400859730:web:2dc98526274efb6cc0018b',
  measurementId: 'G-3T0SKZFBBM',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const { getAuth, initializeAuth } = FirebaseAuth;
const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence as (
  storage: typeof AsyncStorage
) => Persistence;

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { auth, db };
export default app;
