import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  // Validate that critical environment variables exist
  if (
    !process.env.FBS_PROJECT_ID ||
    !process.env.FBS_PRIVATE_KEY ||
    !process.env.FBS_CLIENT_EMAIL
  ) {
    throw new Error(
      "Missing Firebase Admin environment variables (FBS_PROJECT_ID, FBS_PRIVATE_KEY, or FBS_CLIENT_EMAIL) in .env.local",
    );
  }

  initializeApp({
    credential: cert({
      type: process.env.FBS_TYPE,
      projectId: process.env.FBS_PROJECT_ID,
      privateKeyId: process.env.FBS_PRIVATE_KEY_ID,
      // Crucial: Replace literal '\n' text strings with actual newline characters
      privateKey: process.env.FBS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FBS_CLIENT_EMAIL,
      clientId: process.env.FBS_CLIENT_ID,
      authUri: process.env.FBS_AUTH_URI,
      tokenUri: process.env.FBS_TOKEN_URI,
      authProviderX509CertUrl: process.env.FBS_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.FBS_CLIENT_X509_CERT_URL,
      universeDomain: process.env.FBS_UNIVERSE_DOMAIN,
    }),
  });
}

export const adminDb = getFirestore();
