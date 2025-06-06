import Post from "~/components/Post";
import PostSkeleton from "~/components/PostSkeleton";
import { categories, fakePosts } from "~/lib/constants";
import { db } from "firebase/connection";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  increment,
  addDoc,
} from "firebase/firestore";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Await, useRouteLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/react";
import { Suspense } from "react";
import type {
  PostData,
  RawPostData,
  ComentData,
  UserData,
  UserMap,
} from "~/types/post";

type LoaderData = {
  posts: {
    id: string;
    userId: string;
    title: string;
    description: string;
    imgs: string[];
    createdAt: Date;
    likes: number;
    saves?: number; // si lo usas o no
    coments: {
      id: string;
      userId: string;
      coment: string;
      createdAt: Date;
      replys: {
        id: string;
        userId: string;
        coment: string;
        createdAt: Date;
      }[];
    }[];
  }[];
  userMap: {
    [key: string]: UserData;
  };
};

export async function loader() {
  const postsSnap = await getDocs(
    query(collection(db, "posts"), orderBy("createdAt", "desc"))
  );

  const posts = await Promise.all(
    postsSnap.docs.map(async (doc) => {
      const postData = doc.data() as RawPostData;
      const postId = doc.id;
      const createdAt =
        "toDate" in postData.createdAt
          ? postData.createdAt.toDate()
          : postData.createdAt;

      // Comentarios
      const comentsSnap = await getDocs(
        query(
          collection(db, "posts", postId, "coments"),
          orderBy("createdAt", "asc")
        )
      );

      const comentsRaw = await Promise.all(
        comentsSnap.docs.map(async (c) => {
          const data = c.data();

          // Respuestas de cada comentario
          const replysSnap = await getDocs(
            query(
              collection(db, "posts", postId, "coments", c.id, "replys"),
              orderBy("createdAt", "asc")
            )
          );

          const replys = replysSnap.docs.map((r) => {
            const replyData = r.data();
            return {
              id: r.id,
              userId: replyData.userId,
              coment: replyData.coment,
              createdAt:
                "toDate" in replyData.createdAt
                  ? replyData.createdAt.toDate()
                  : replyData.createdAt,
            };
          });

          return {
            id: c.id,
            userId: data.userId,
            coment: data.coment,
            createdAt:
              "toDate" in data.createdAt
                ? data.createdAt.toDate()
                : data.createdAt,
            replys,
          };
        })
      );

      return {
        id: postId,
        userId: postData.userId,
        title: postData.title ?? "",
        description: postData.description ?? "",
        imgs: postData.imgs ?? [],
        createdAt,
        likes: postData.likes ?? 0,
        coments: comentsRaw,
      };
    })
  );

  // Usuarios únicos
  const postUserIds = posts.map((p) => p.userId);
  const comentUserIds = posts.flatMap((p) => p.coments.map((c) => c.userId));
  const replyUserIds = posts.flatMap((p) =>
    p.coments.flatMap((c) => c.replys.map((r) => r.userId))
  );
  const allUserIds = [
    ...new Set([...postUserIds, ...comentUserIds, ...replyUserIds]),
  ];

  const usersData = await Promise.all(
    allUserIds.map(async (uid) => {
      const userSnap = await getDoc(doc(db, "users", uid));
      const data = userSnap.data();
      return { id: uid, ...(data as Omit<UserData, "id">) };
    })
  );

  const userMap: UserMap = Object.fromEntries(
    usersData.map((user) => [user.id, user])
  );

  return defer({
    posts,
    userMap,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const userId = data.get("userId")?.toString();
  const postId = data.get("postId")?.toString();
  const intent = data.get("intent");

  if (!userId || !postId) return null;

  try {
    if (intent === "likeToggle") {
      const userSnap = await getDoc(doc(db, "users", userId));
      const postSnap = await getDoc(doc(db, "posts", postId));
      if (!userSnap.exists() || !postSnap.exists()) return null;
      const isLiked = userSnap.data().likedPostIds.includes(postId);
      await updateDoc(doc(db, "users", userId), {
        likedPostIds: isLiked ? arrayRemove(postId) : arrayUnion(postId),
      });
      await updateDoc(doc(db, "posts", postId), {
        likes: isLiked ? increment(-1) : increment(1),
      });
      return null;
    }

    if (intent === "saveToggle") {
      const userSnap = await getDoc(doc(db, "users", userId));
      const postSnap = await getDoc(doc(db, "posts", postId));
      if (!userSnap.exists() || !postSnap.exists()) return null;
      const isSaved = userSnap.data().savedPostIds.includes(postId);
      await updateDoc(doc(db, "users", userId), {
        savedPostIds: isSaved ? arrayRemove(postId) : arrayUnion(postId),
      });
      await updateDoc(doc(db, "posts", postId), {
        saves: isSaved ? increment(-1) : increment(1),
      });

      return null;
    }

    if (intent === "replyPost") {
      const coment = data.get("coment");

      const comentData = {
        userId,
        coment,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "posts", postId, "coments"), comentData);

      return null;
    }

    if (intent === "replyComent") {
      const coment = data.get("coment")?.toString();
      const comentId = data.get("comentId")?.toString();

      if (!comentId) {
        console.log("error aquí");
        return null;
      }

      const replyData = {
        coment: coment,
        userId: userId,
        createdAt: new Date(),
      };

      await addDoc(
        collection(db, "posts", postId, "coments", comentId, "replys"),
        replyData
      );

      return null;
    }

    return null;
  } catch (error) {
    return { error: error };
  }
}

export default function Inicio() {
  const { posts, userMap } = useLoaderData<LoaderData>();
  const routeLoaderData = useRouteLoaderData<UserData>("routes/_private");

  // console.log(posts);

  // console.log(posts);

  return (
    <main className="p-8 h-screen overflow-scroll">
      <h2 className="text-2xl mb-4 font-bold">Categorías</h2>
      <div className="flex gap-3 w-full flex-wrap text-xs mb-10">
        <button className="p-2 rounded-md bg-[#272727] hover:bg-[#494949] transition-all h-8">
          <p>Todas</p>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className="p-2 rounded-md bg-[#272727] hover:bg-[#494949] transition-all h-8"
          >
            <p>{category}</p>
          </button>
        ))}
      </div>

      <section className="flex flex-col w-full items-center gap-8">
        <Suspense fallback={<PostSkeleton />}>
          <Await resolve={posts}>
            {(postsResolved: LoaderData["posts"]) => (
              <Await resolve={userMap}>
                {(userMapResolved: LoaderData["userMap"]) =>
                  postsResolved?.map((post) => (
                    <Post
                      key={post.id}
                      data={post}
                      numeroComentarios={post.coments.length}
                      postUser={userMapResolved[post.userId]}
                      isLiked={
                        routeLoaderData
                          ? routeLoaderData.likedPostIds?.includes(post.id)
                          : false
                      }
                      isSaved={
                        routeLoaderData
                          ? routeLoaderData.savedPostIds?.includes(post.id)
                          : false
                      }
                      coments={post.coments.map((coment) => ({
                        ...coment,
                        name: userMapResolved[coment.userId]?.name ?? "Anónimo",
                        profilePhoto:
                          userMapResolved[coment.userId]?.profilePhoto,
                        replys: coment.replys.map((reply) => ({
                          ...reply,
                          name:
                            userMapResolved[reply.userId]?.name ?? "Anónimo",
                          profilePhoto:
                            userMapResolved[reply.userId]?.profilePhoto,
                        })),
                      }))}
                    />
                  ))
                }
              </Await>
            )}
          </Await>
        </Suspense>
      </section>
    </main>
  );
}
