// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "customer-support-2a241.firebaseapp.com",
  projectId: "customer-support-2a241",
  storageBucket: "customer-support-2a241.appspot.com",
  messagingSenderId: "596399618333",
  appId: "1:596399618333:web:8b93c32c986438a0a089f4",
  measurementId: "G-MPWYCETQR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence); // Ensure persistence is set

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export { auth, provider, signInWithGoogle, db, onAuthStateChanged, storage };