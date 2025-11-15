import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as signIn,
  getRedirectResult as _getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import "./migration";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_APP_ID,
  measurementId: import.meta.env.VITE_REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
const functions = getFunctions(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithPopup = () => signIn(auth, provider);
export const signInWithRedirect = () => signIn(auth, provider);
export const signOut = () => auth.signOut();
export const getRedirectResult = () => _getRedirectResult(auth);

export const onAuthStateChanged = (callback) =>
  auth.onAuthStateChanged(callback);

export {
  app,
  storage,
  functions,
  auth,
  provider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
