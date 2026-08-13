import { cert, getApps, initializeApp } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!base64ServiceAccount) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable in .env.local",
    );
  }

  // Decode the Base64 string back into a JSON object
  const serviceAccountJson = Buffer.from(
    base64ServiceAccount,
    "base64",
  ).toString("utf-8");
  const serviceAccount = JSON.parse(serviceAccountJson);

  initializeApp({
    credential: cert(serviceAccount),
  });
}
export const adminDb = getFirestore();
