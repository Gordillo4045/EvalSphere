// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions as getFirebaseFunctions, httpsCallable as firebaseHttpsCallable, connectFunctionsEmulator } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APP_API_KEY,
    authDomain: "eval-sphere.firebaseapp.com",
    projectId: "eval-sphere",
    storageBucket: "eval-sphere.appspot.com",
    messagingSenderId: "184962243352",
    appId: "1:184962243352:web:a751b134904a7e3c201c6d",
    measurementId: "G-3N0YJVY1KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFirebaseFunctions(app);
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    // connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 8000);
    // connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
const httpsCallable = (name: string) => firebaseHttpsCallable(functions, name);

export { auth, db, storage, functions, httpsCallable };

