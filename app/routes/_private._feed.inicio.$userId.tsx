import { redirect, useLoaderData, useNavigation, Link } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getDoc, doc } from "firebase/firestore";
import { db, storage } from "firebase/connection";
import { adminAuth } from "firebase/admin";
import { userTokenCookie } from "utils/session";
import { defer } from "@remix-run/node";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Suspense } from "react";
import { Await } from "@remix-run/react";
import GallerySkeleton from "~/components/GallerySkeleton";
import GalleryProfile from "~/components/GalleryProfile";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

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
  const userId = params.userId;

  if (!userId) return redirect("/inicio");

  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookieHeader);

    if (!token) return redirect("/login");

    const decodedToken = await adminAuth.verifyIdToken(token);
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return redirect("/inicio");

    const isUser = docSnap.id === decodedToken.uid;

    const data = {
      ...docSnap.data(),
      id: docSnap.id,
      isUser,
    };

    const gallery = (async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc") // Asegúrate de tener este campo en tus posts
      );

      const querySnapshot = await getDocs(postsQuery);

      const allImgs: string[] = [];

      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        if (Array.isArray(postData.imgs)) {
          allImgs.push(...postData.imgs);
        }
      });

      return allImgs.slice(0, 9); // Solo las 9 más recientes
    })();

    return defer({
      data,
      gallery, // Sigue siendo una promesa
    });
  } catch (error) {
    console.error(error);
    return { error: String(error) };
  }
}

export default function Profile() {
  const { data, gallery } = useLoaderData<LoaderData>();

  // console.log(data);

  return (
    <main className="p-8 w-full h-screen overflow-scroll">
      {data.isUser && <h2 className="text-2xl mb-10 font-bold">Mi perfil</h2>}
      <div className="flex gap-6 items-center">
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
            {data.isUser && (
              <button className="flex gap-2 font-bold text-lg">
                <img src="/edit-icon.svg" alt="" className="w-3" />
                Editar perfil
              </button>
            )}
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
      </div>
      <section className="mt-10">
        <div className="flex flex-col w-full mt-8">
          <div className="flex w-full py-10 border-y-[1px] mb-8">
            <div className="w-1/3 text-sm border-r-[1px] pr-8">
              <p className="text-2xl mb-3">Sobre mí:</p>
              <p className="font-light">{data.aboutYourProject}</p>
            </div>
            <div className="w-1/3 text-sm px-8 border-r-[1px]">
              <p className="text-2xl mb-3">Intereses:</p>
              <p className="font-light">{data.wantsFromEspora}</p>
            </div>
            <div className="w-1/3 pl-8 text-xs">
              <p className="text-2xl mb-3">Contacto:</p>
              <p className="font-light flex gap-2 items-center">
                <img src="/tel-icon.svg" /> +57 000 000 00 00
              </p>
              <p className="font-light flex gap-2 mt-2 items-center">
                <img src="/email-icon.svg" /> {data.email}
              </p>
              <p className="font-light flex gap-2 mt-2 items-center">
                <img src="/link-icon.svg" /> https://www.linkedin.com/in/prueba/
              </p>
              <p className="font-light flex gap-2 mt-2 items-center">
                <img src="/link-icon.svg" /> https://www.linkedin.com/in/prueba/
              </p>
            </div>
          </div>
          <div className="w-full py-4">
            <div className="flex w-full justify-between items-center mb-3">
              <p className="text-2xl">
                {data.isUser ? "Mi Galería" : "Galería"}
              </p>
              <Link to={`/galeria/${data.id}`} className="text-red-300">
                Ver todo
              </Link>
            </div>
            <Suspense fallback={<GallerySkeleton />}>
              <Await resolve={gallery}>
                {(gallery) => <GalleryProfile galleryUrls={gallery} />}
              </Await>
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
