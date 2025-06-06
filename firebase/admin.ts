import {
  initializeApp,
  cert,
  getApps,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccountJson from "../espora-bac69-firebase-adminsdk-fbsvc-671fb32b26.json" assert { type: "json" };

const serviceAccount = serviceAccountJson as ServiceAccount;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();

export { adminAuth };
