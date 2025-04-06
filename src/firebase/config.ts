import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (find this in Firebase Console > Project Settings)
const firebaseConfig = {
    apiKey: "AIzaSyDtIlmYUxvWGBGPOPzBuLOoXRYCsA0MmGY",
    authDomain: "job-app-9061a.firebaseapp.com",
    projectId: "job-app-9061a",
    storageBucket: "job-app-9061a.firebasestorage.app",
    messagingSenderId: "112013673094",
    appId: "1:112013673094:web:0ed87014cb5f9c06640707",
    measurementId: "G-JYC0TZJWWN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore database
export const db = getFirestore(app);

