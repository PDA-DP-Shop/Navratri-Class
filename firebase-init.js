// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGp2GySAIiaV1F5M8pmd17aZWD0AoPIe4",
    authDomain: "navratri-7a5a7.firebaseapp.com",
    projectId: "navratri-7a5a7",
    storageBucket: "navratri-7a5a7.firebasestorage.app",
    messagingSenderId: "249512194624",
    appId: "1:249512194624:web:2df1852f5a6a5844fba5a5",
    measurementId: "G-984EXN4BTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase instances
export { app, analytics, db, storage }; 