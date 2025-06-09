import { Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { userTokenCookie } from "utils/session";
import { adminAuth } from "firebase/admin";
import { defer, redirect } from "@remix-run/node";
import { db } from "firebase/connection";
import {
  getDoc,
  doc,
  collection,
  query,
  getDocs,
  where,
  orderBy,
} from "firebase/firestore";
import { useLoaderData, Link, Await } from "@remix-run/react";
import { Suspense } from "react";
import GallerySkeleton from "~/components/GallerySkeleton";
import GalleryProfile from "~/components/GalleryProfile";

type data = {
  name?: string;
  email?: string;
  profilePhoto?: string;
  category?: string;
  aboutYourProject?: string;
  wantsFromEspora?: string;
  id: string;
  uid: string;
  isUser: boolean;
  followed?: string[];
  followers?: string[];
};

type LoaderData = {
  data: data;
  gallery?: string[];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookieHeader);

    if (!token) {
      return redirect("/login");
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    const docSnap = await getDoc(doc(db, "users", decodedToken.uid));

    if (!docSnap.exists()) throw new Error("Usuario no encontrado");

    const data = {
      ...docSnap.data(),
      id: docSnap.id,
    };

    const gallery = (async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", decodedToken.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(postsQuery);

      // Ahora un array de objetos { postId, url }
      const allImgs: { postId: string; url: string }[] = [];

      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        if (Array.isArray(postData.imgs)) {
          postData.imgs.forEach((imgUrl: string) => {
            allImgs.push({
              postId: doc.id,
              url: imgUrl,
            });
          });
        }
      });

      return allImgs;
    })();

    return defer({
      data,
      gallery,
    });
  } catch (error) {
    // throw new Error("Ocurrió un problema inesperado");
    return redirect("/inicio");
  }
}

export default function Galeria() {
  const { data, gallery } = useLoaderData<LoaderData>();

  console.log(gallery);

  return (
    <main className="p-8 w-full h-screen overflow-y-scroll">
      <section className="flex gap-6 items-center border-b-[1px] pb-10">
        <img
          src={data?.profilePhoto ?? "/profile-photo.png"}
          alt=""
          className="w-36 h-36 rounded-full"
        />
        <div>
          <p className="text-gray-200/40 text-xl tracking-wider font-light">
            {data?.category?.toUpperCase()}
          </p>
          <p className="text-4xl flex items-center gap-10">
            {data?.name?.split(" ").slice(0, 2).join(" ")}
          </p>

          <div className="flex mt-3 gap-8">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                className="text-2xl font-bold bg-gradient-to-b from-[#F46868] to-[#302B4F] bg-clip-text text-transparent"
              >
                {data.followers?.length}
              </button>

              <p className="text-xl">
                {data.followers?.length !== 1 ? "Seguidores" : "Seguidor"}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <button
                type="button"
                className="text-2xl font-bold bg-gradient-to-b from-[#F46868] to-[#302B4F] bg-clip-text text-transparent"
              >
                {data.followed?.length}
              </button>

              <p className="text-xl">
                {data.followed?.length !== 1 ? "Seguidos" : "Seguido"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4">
        <div className="flex w-full justify-between items-center mb-10">
          <p className="text-2xl">Mi Galería</p>
          <Link className="text-red-300" to={`/inicio/${data.id}`}>
            Regresar
          </Link>
        </div>
        <Outlet context={{ gallery, data }} />
      </section>
    </main>
  );
}
