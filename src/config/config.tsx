// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDK2yCLaBVxFrGSCHCJg5zFufff2VkOCS8",
    authDomain: "eval-sphere.firebaseapp.com",
    projectId: "eval-sphere",
    storageBucket: "eval-sphere.appspot.com",
    messagingSenderId: "184962243352",
    appId: "1:184962243352:web:a751b134904a7e3c201c6d",
    measurementId: "G-3N0YJVY1KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);