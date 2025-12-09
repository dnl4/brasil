import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

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
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
