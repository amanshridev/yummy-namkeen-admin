import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyBO365jTBbNe7nTOeaF2rk0Cl4UTI1hioM",

  authDomain: "namkeen-c640c.firebaseapp.com",

  projectId: "namkeen-c640c",

  storageBucket: "namkeen-c640c.appspot.com",

  messagingSenderId: "450420024070",

  appId: "1:450420024070:web:47cc44e7ad373b7407f487"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

