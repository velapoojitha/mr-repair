
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtwbtrq5dthIINrZDrsexeHVrfbH8lY1w",
  authDomain: "mr-repair-14a34.firebaseapp.com",
  projectId: "mr-repair-14a34",
  storageBucket: "mr-repair-14a34.appspot.app",
  messagingSenderId: "600301507799",
  appId: "1:600301507799:web:31620d7b4562303377cc92",
  measurementId: "G-Q64TT6F939"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore();