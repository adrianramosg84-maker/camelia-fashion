import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7MMpdhkR6rgoBENvM49ssJyrv7O_3HLB",
  authDomain: "camelia-fashion.firebaseapp.com",
  projectId: "camelia-fashion",
  storageBucket: "camelia-fashion.firebasestorage.app",
  messagingSenderId: "337321312183",
  appId: "1:337321312183:web:ed48187d87bd7d47b9f232"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
