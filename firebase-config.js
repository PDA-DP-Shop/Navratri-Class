// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDy3oQp4yCZcJdFq4hFpfo_sGaFGlRqBOw",
    authDomain: "navratri-form.firebaseapp.com",
    projectId: "navratri-form",
    storageBucket: "navratri-form.firebasestorage.app",
    messagingSenderId: "101025748349",
    appId: "1:101025748349:web:d800b3699ac611bfe1a814",
    measurementId: "G-MYZTE1VTZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase instances
export { app, analytics, db, storage }; 