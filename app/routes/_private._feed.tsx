import { Outlet, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getDoc, doc } from "firebase/firestore";
import { db } from "firebase/connection";
import { adminAuth } from "firebase/admin";
import { userTokenCookie } from "utils/session";
import Nav from "~/components/Nav";
import Aside from "~/components/Aside";

type LoaderData = {
  name?: string;
  photoURL?: string;
  category?: string;
  uid: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookie = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookie);

    if (!token) {
      // No hay token, redirige al login
      return redirect("/login");
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

    if (!docSnap.data()?.registerCompleted) {
      return redirect("/login");
    }

    return null;
  } catch (error) {
    throw new Error("Algo salió mal durante la carga, intanta más tarde");
  }
}

export default function Feed() {
  const data = useRouteLoaderData<LoaderData>("routes/_private");

  return (
    <main className="flex w-screen h-screen text-white">
      <Nav data={data} />
      <section className="w-8/12 bg-black">
        <Outlet />
      </section>
      <Aside />
    </main>
  );
}
