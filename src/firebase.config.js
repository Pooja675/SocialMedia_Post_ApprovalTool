
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAc9K-BNkt7-lVhPUEA9SSZ2T2XKhooktE",
  authDomain: "smpostapproval.firebaseapp.com",
  projectId: "smpostapproval",
  storageBucket: "smpostapproval.appspot.com",
  messagingSenderId: "317555216235",
  appId: "1:317555216235:web:4090e020473579a753c62e"
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

