import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBOt3N32UkdftC0lrSwisZGFxBy4ajN2JU",
  authDomain: "espora-bac69.firebaseapp.com",
  projectId: "espora-bac69",
  storageBucket: "espora-bac69.firebasestorage.app",
  messagingSenderId: "415802101461",
  appId: "1:415802101461:web:b56c369ef27dbbfbbf5c5c",
  measurementId: "G-5N7B8YVKEQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage();
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: "popup",
});

export { auth, googleProvider, facebookProvider, db, storage };
