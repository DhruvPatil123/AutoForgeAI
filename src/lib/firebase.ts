import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "custom-xanthometer-k07pf",
  appId: "1:999651511679:web:9c5bd578ea5c542ca91e4a",
  apiKey: "AIzaSyAWOlQgvJr6B2iqn4RRQyOzcOHO6L9ZZLo",
  authDomain: "custom-xanthometer-k07pf.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-17949887-310b-40db-a4cc-2c72f589c60f",
  storageBucket: "custom-xanthometer-k07pf.firebasestorage.app",
  messagingSenderId: "999651511679"
};

const app = initializeApp(firebaseConfig);

// Use custom provisioned database ID
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { db };
export default app;
