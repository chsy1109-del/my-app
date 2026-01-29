import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ 아래 정보는 본인의 Firebase Console에서 가져온 값으로 교체해야 합니다!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);