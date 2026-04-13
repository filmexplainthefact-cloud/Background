import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, remove, push, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export { ref, onValue, set, update, remove, push, get };

const firebaseConfig = {
  apiKey: "AIzaSyA_zA-siOL72nHKCCMW9zk891HDWkbeOgs",
  authDomain: "k-upl-6a0db.firebaseapp.com",
  databaseURL: "https://k-upl-6a0db-default-rtdb.firebaseio.com",
  projectId: "k-upl-6a0db",
  storageBucket: "k-upl-6a0db.firebasestorage.app",
  messagingSenderId: "1024864441721",
  appId: "1:1024864441721:web:7f9b2040c57bc3d5c44ba8"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export { ref, onValue, set, update, remove, push, get, signInWithEmailAndPassword, signOut, onAuthStateChanged };
