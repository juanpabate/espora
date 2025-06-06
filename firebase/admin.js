import {
  initializeApp,
  cert,
  getApps,
  // ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
// import serviceAccountJson from "../espora-bac69-firebase-adminsdk-fbsvc-7ce46b3cf2.json" assert { type: "json" };

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();

export { adminAuth };
