import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8Il1zTFrp0LE_mIY65uErrLnVUBa_xVE",
  authDomain: "brasiguaios-a9ddf.firebaseapp.com",
  projectId: "brasiguaios-a9ddf",
  storageBucket: "brasiguaios-a9ddf.firebasestorage.app",
  messagingSenderId: "138400859730",
  appId: "1:138400859730:web:2dc98526274efb6cc0018b",
  measurementId: "G-3T0SKZFBBM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
