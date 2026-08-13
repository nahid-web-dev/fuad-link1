import { cert, getApps, initializeApp } from "firebase-admin";
import serviceAccount from "./firebase_service.json";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
export const adminDb = getFirestore();
