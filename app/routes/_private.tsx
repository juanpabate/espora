import { Outlet, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { userTokenCookie } from "utils/session";
import { adminAuth } from "firebase/admin";
import { getDoc, doc } from "firebase/firestore";
import { db } from "firebase/connection";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookieHeader);

    if (!token) {
      // No hay token, redirige al login
      return redirect("/login");
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

    const userDb = docSnap.data();

    // console.log({
    //   ...decodedToken,
    //   photoURL: userDb?.profilePhoto,
    // });
    return {
      ...decodedToken,
      likedPostIds: userDb?.likedPostIds,
      savePostIds: userDb?.savedPostIds,
      photoURL: userDb?.profilePhoto,
      category: userDb?.category,
      name: userDb?.name,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return redirect("/login");
  }
}

export default function PrivateRoutes() {
  return <Outlet />;
}
