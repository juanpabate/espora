import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { db } from "firebase/connection";
import { redirect } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  Link,
  Form,
  useFetcher,
  useRouteLoaderData,
} from "@remix-run/react";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import {
  FaHeart,
  FaRegHeart,
  FaRegBookmark,
  FaBookmark,
  FaReply,
} from "react-icons/fa";
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

type UserLogged = {
  name: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      email: string[];
    };
    sign_in_provider: string;
  };
  uid: string;
  likedPostIds: string[];
  savePostIds: string[];
  photoURL: string;
  category: string;
};

type UserData = {
  id: string;
  name: string;
  userName: string;
  email: string;
  country: string;
  region: string;
  birthdate: string; // Podrías usar `Date` si la parseas
  profilePhoto: string;
  category: string;
  artisticStyle: string;
  aboutYourProject: string;
  wantsFromEspora: string;
  registerCompleted: boolean;
  likedPostIds: string[];
  savedPostIds: string[];
  followers: string[];
  followed: string[];
};

type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

type Reply = {
  id: string;
  userId: string;
  coment: string;
  createdAt: FirebaseTimestamp;
  userName: string;
  userPhoto: string;
};

type Comment = {
  id: string;
  userId: string;
  coment: string;
  createdAt: FirebaseTimestamp;
  userName: string;
  userPhoto: string;
  replys: Reply[];
};

type Post = {
  id: string;
  title: string;
  saves: number;
  imgs: string[]; // URLs de las imágenes
  createdAt: FirebaseTimestamp;
  likes: number;
  description: string;
  userId: string;
};

type LoaderData = {
  post: Post;
  coments: Comment[];
};

type ContextType = {
  data: UserData;
};

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const userId = data.get("userId")?.toString();
  const postId = data.get("postId")?.toString();
  const intent = data.get("intent");

  if (!userId || !postId) {
    return null;
  }

  try {
    if (intent === "likeToggle") {
      const userSnap = await getDoc(doc(db, "users", userId));
      const postSnap = await getDoc(doc(db, "posts", postId));
      if (!userSnap.exists() || !postSnap.exists()) {
        throw new Error("El usuario no existe");
      }
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { postId } = params;

  if (!postId) return redirect("/inicio");

  try {
    // Obtener el post
    const postSnap = await getDoc(doc(db, "posts", postId));
    if (!postSnap.exists()) return redirect("/inicio");

    const post = {
      id: postSnap.id,
      ...postSnap.data(),
    };

    // Obtener comentarios
    const comentsSnap = await getDocs(
      collection(db, "posts", postId, "coments")
    );

    const commentsWithReplies = await Promise.all(
      comentsSnap.docs.map(async (comentDoc) => {
        type CommentData = {
          id: string;
          userId: string;
          [key: string]: any; // o los demás campos que necesites
        };

        const rawCommentData = comentDoc.data();

        if (!rawCommentData.userId) {
          throw new Error("Comentario sin userId");
        }

        const commentData: CommentData = {
          id: comentDoc.id,
          userId: rawCommentData.userId,
          ...rawCommentData,
        };

        // Obtener datos del usuario del comentario
        const commentUserSnap = await getDoc(
          doc(db, "users", commentData.userId)
        );
        const commentUserData = commentUserSnap.exists()
          ? commentUserSnap.data()
          : {};

        // Obtener respuestas
        const repliesSnap = await getDocs(
          collection(db, "posts", postId, "coments", comentDoc.id, "replys")
        );

        const replys = await Promise.all(
          repliesSnap.docs.map(async (replyDoc) => {
            type ReplyData = {
              id: string;
              userId: string;
              [key: string]: any;
            };

            const rawReplyData = replyDoc.data();

            if (!rawReplyData.userId) {
              throw new Error("Reply sin userId");
            }

            const replyData: ReplyData = {
              id: replyDoc.id,
              userId: rawReplyData.userId,
              ...rawReplyData,
            };

            const replyUserSnap = await getDoc(
              doc(db, "users", replyData.userId)
            );
            const replyUserData = replyUserSnap.exists()
              ? replyUserSnap.data()
              : {};

            return {
              ...replyData,
              userName: replyUserData.name || null,
              userPhoto: replyUserData.profilePhoto || null,
            };
          })
        );

        return {
          ...commentData,
          userName: commentUserData.name || null,
          userPhoto: commentUserData.profilePhoto || null,
          replys,
        };
      })
    );

    return {
      post,
      coments: commentsWithReplies,
    };
  } catch (error) {
    console.error("Error al cargar el post:", error);
    return redirect("/inicio");
  }
}

export default function PostGallery() {
  const [imgIndex, setImgIndex] = useState<number>(0);
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [coment, setComent] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const { post, coments } = useLoaderData<LoaderData>();
  const { data } = useOutletContext<ContextType>();
  const userLoged = useRouteLoaderData<UserLogged>("routes/_private");

  //   console.log(data);

  const timeAgo = formatDistanceToNowStrict(
    new Date(post.createdAt.seconds * 1000 + post.createdAt.nanoseconds / 1e6),
    {
      locale: es,
    }
  );

  const likeFetcher = useFetcher();
  const saveFetcher = useFetcher();
  const comentFetcher = useFetcher();
  const replyFetcher = useFetcher();

  useEffect(() => {
    if (comentFetcher.state === "idle") {
      setComent("");
    }
  }, [comentFetcher.state]);

  useEffect(() => {
    if (replyFetcher.state === "idle") {
      setReplyText("");
      setOpenReply(null);
    }
  }, [replyFetcher.state]);

  const optimisticLike = likeFetcher.formData
    ? likeFetcher.formData.get("like") === "like"
    : data.likedPostIds.includes(post.id);

  const optimisticLikesCount = likeFetcher.formData
    ? likeFetcher.formData.get("like") === "like"
      ? post.likes + 1
      : post.likes - 1
    : post.likes;

  const optimisticSave = saveFetcher.formData
    ? saveFetcher.formData.get("save") === "save"
    : data.savedPostIds.includes(post.id);

  return (
    <div className="flex w-full justify-center">
      <article className="w-[70%] bg-[#272727] p-6 rounded-xl">
        <div className="flex w-full justify-between items-center text-sm mb-8">
          <Link to={`/inicio/${data.id}`} className="flex items-center gap-3">
            <img
              src={data.profilePhoto || "/profile-photo.png"}
              alt="foto de perfil"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col text-sm">
              <p className="font-bold">{data.name || "Usuario"}</p>
              <p className="text-[#7D7D7D]">{data.category || "Categoría"}</p>
            </div>
          </Link>
          <p className="text-[#7D7D7D]">{`Hace ${timeAgo}`}</p>
        </div>

        <p className="mb-6 font-semibold">{post.title}</p>
        <p className="mb-6">{post.description}</p>

        {post.imgs && (
          <div className="w-full relative bg-[#1a1a1a] rounded-xl mb-6 overflow-hidden flex justify-center aspect-[16/9]">
            <img
              src={post.imgs[imgIndex]}
              alt="imagen del post"
              className="w-full h-full object-contain transition-opacity duration-500 opacity-0"
              onLoad={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            />
            {post.imgs.length > 1 && (
              <>
                <button
                  type="button"
                  className={`p-2 rounded-md absolute top-1/2 select-none left-3 text-white text-xl bg-black/35 hover:bg-black transition-all ${
                    imgIndex === 0 ? "hidden" : ""
                  }`}
                  onClick={() => setImgIndex(imgIndex - 1)}
                >
                  <FaChevronLeft />
                </button>

                <button
                  type="button"
                  className={`p-2 rounded-md absolute top-1/2 select-none right-3 text-white text-xl bg-black/35 hover:bg-black transition-all ${
                    imgIndex === post.imgs.length - 1 ? "hidden" : ""
                  }`}
                  onClick={() => setImgIndex(imgIndex + 1)}
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex w-full justify-between mb-6">
          <p className="font-extralight">{`${coments.length.toString()} comentarios`}</p>
          <div className="flex gap-3">
            <likeFetcher.Form method="post">
              <input type="hidden" name="userId" value={userLoged?.uid} />
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="intent" value="likeToggle" />

              <button
                name="like"
                value={optimisticLike ? "notLike" : "like"}
                type="submit"
                className="cursor-pointer text-2xl flex gap-2"
              >
                <p className="font-normal text-lg">{optimisticLikesCount}</p>
                {optimisticLike ? <FaHeart /> : <FaRegHeart />}
              </button>
            </likeFetcher.Form>

            <saveFetcher.Form method="post">
              <input type="hidden" name="userId" value={userLoged?.uid} />
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="intent" value="saveToggle" />

              <button
                name="save"
                value={optimisticSave ? "notSave" : "save"}
                type="submit"
                className="cursor-pointer text-2xl flex items-center"
              >
                {optimisticSave ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </saveFetcher.Form>
          </div>
        </div>

        <section className="w-full">
          {coments.map((coment) => (
            <>
              <div
                key={coment.id}
                className="bg-[#6B6B6B66] flex flex-col p-6 rounded-lg gap-3 mb-3"
              >
                <div className="flex gap-4">
                  <Link to={`/inicio/${coment.userId}`}>
                    <img
                      className="w-14 h-14 rounded-full"
                      src={coment.userPhoto || "/profile-photo.png"}
                      alt={`${coment.userName} foto`}
                    />
                  </Link>
                  <div>
                    <Link to={`/inicio/${coment.userId}`}>
                      <p className="font-bold mb-3">{coment.userName}</p>
                    </Link>
                    <p className="text-sm font-extralight">{coment.coment}</p>
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <button
                    onClick={() =>
                      setOpenReply(openReply === coment.id ? null : coment.id)
                    }
                    className="flex gap-2 items-center"
                  >
                    <FaReply />
                    <p>Responder</p>
                  </button>
                </div>

                {openReply === coment.id && (
                  <replyFetcher.Form
                    method="post"
                    className="flex w-full gap-2 border-[1px] border-white rounded-xl p-2"
                  >
                    <img
                      src={userLoged?.photoURL || "profile-photo.png"}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <input
                      type="text"
                      placeholder="Comentar publicación"
                      name="coment"
                      className="w-full bg-transparent outline-none"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <input type="hidden" name="userId" value={userLoged?.uid} />
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="comentId" value={coment.id} />
                    <input type="hidden" name="intent" value="replyComent" />
                    <button type="submit">
                      <img src="/send-icon.svg" alt="enviar" className="w-6" />
                    </button>
                  </replyFetcher.Form>
                )}
              </div>

              <div className="mb-3">
                {coment.replys &&
                  coment.replys.length > 0 &&
                  coment.replys.map((reply, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-[#6B6B6B66] ml-8 flex justify-end pb-3 relative"
                    >
                      <div className="flex flex-col justify-center">
                        <span className="border-t-2 border-[#6B6B6B66] w-10 left-0 top-[45%]" />
                      </div>
                      <div className="bg-[#6B6B6B66] flex flex-col p-6 rounded-lg gap-3 w-[95%]">
                        <div className="flex gap-4">
                          <Link to={`/inicio/${reply.userId}`}>
                            <img
                              className="max-w-14 h-14 rounded-full"
                              src={reply.userPhoto || "/profile-photo.png"}
                              alt={`${reply.userName} foto`}
                            />
                          </Link>
                          <div>
                            <Link to={`/inicio/${reply.userId}`}>
                              <p className="font-bold mb-3">{reply.userName}</p>
                            </Link>
                            <p className="text-sm font-extralight">
                              {reply.coment}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ))}
        </section>

        <comentFetcher.Form
          method="post"
          className="flex w-full gap-2 border-[1px] border-white rounded-xl p-2"
        >
          <img
            src={userLoged?.photoURL || "profile-photo.png"}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            placeholder="Comentar publicación"
            name="coment"
            className="w-full bg-transparent outline-none"
            value={coment}
            onChange={(e) => setComent(e.target.value)}
          />
          <input type="hidden" name="userId" value={userLoged?.uid} />
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="intent" value="replyPost" />
          <button type="submit">
            <img src="/send-icon.svg" alt="enviar" className="w-6" />
          </button>
        </comentFetcher.Form>
      </article>
    </div>
  );
}
