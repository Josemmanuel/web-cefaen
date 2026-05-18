import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCldZHK7owFDLoYWWmbqJDjPW61ZjyNGtc",
  authDomain: "cefaen-6b340.firebaseapp.com",
  projectId: "cefaen-6b340",
  storageBucket: "cefaen-6b340.firebasestorage.app",
  messagingSenderId: "916199551134",
  appId: "1:916199551134:web:0b290cacc9650bfc5a0b8f"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app