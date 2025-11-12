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

// Text cleaning function
export const cleanHtmlContent = async (htmlText) => {
  try {
    // api is different on dev
    const apiUrl =
      import.meta.env.MODE === "development"
        ? "http://127.0.0.1:5001/timeline-38aac/us-central1"
        : "https://us-central1-timeline-38aac.cloudfunctions.net";

    const response = await fetch(`${apiUrl}/cleanHtmlText`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ htmlText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.cleanedHtml;
  } catch (error) {
    console.error('Error cleaning HTML:', error);
    throw error;
  }
};

function stripMarkdownCodeFencesClient(text) {
  if (!text) return text;
  let t = String(text).trim();
  const fenced = t.match(/^\s*```(?:\w+)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenced) return fenced[1].trim();
  const anyBlock = t.match(/```(?:html)?\s*\n([\s\S]*?)\n```/i);
  if (anyBlock) return anyBlock[1].trim();
  t = t.replace(/^\s*```(?:\w+)?\s*/g, "").replace(/\s*```$/g, "");
  t = t.replace(/^<pre><code>/i, "").replace(/<\/code><\/pre>$/i, "");
  return t.trim();
}

export const summarizeDocument = async (fileUrl) => {
  const apiUrl =
    import.meta.env.MODE === "development"
      ? "http://127.0.0.1:5001/timeline-38aac/us-central1"
      : "https://us-central1-timeline-38aac.cloudfunctions.net";

  const res = await fetch(`${apiUrl}/summarizeDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status} ${t}`);
  }
  const data = await res.json();
  return stripMarkdownCodeFencesClient(data.summary || "");
};
