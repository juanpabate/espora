import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Form, useFetcher, useRouteLoaderData, Link } from "@remix-run/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import {
  FaHeart,
  FaRegHeart,
  FaRegBookmark,
  FaBookmark,
  FaReply,
} from "react-icons/fa";
import type { ComentData, PostData, PostUser } from "~/types/post";

type Coment = {
  id: string;
  name: string;
  coment: string;
  profilePhoto: string;
  userId: string;
  replys?: Coment[];
};

type ComentsProps = {
  coments: Coment[];
  userLoged: UserLoged;
  postId: string;
  userId?: string;
};

type PostProps = {
  data: PostData;
  numeroComentarios: number;
  postUser: PostUser;
  isLiked: boolean;
  isSaved: boolean;
  coments: Coment[];
};

type UserLoged = {
  uid: string;
  photoURL?: string;
};

export function Coments({ coments, userLoged, postId }: ComentsProps) {
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const replyFetcher = useFetcher();

  // console.log(userId);

  useEffect(() => {
    if (replyFetcher.state === "idle") {
      setReplyText("");
      setOpenReply(null);
    }
  }, [replyFetcher.state]);
  return (
    <section className="w-full">
      {coments.map(({ id, name, coment, replys, profilePhoto, userId }) => (
        <>
          <div
            key={id}
            className="bg-[#6B6B6B66] flex flex-col p-6 rounded-lg gap-3 mb-3"
          >
            <div className="flex gap-4">
              <Link to={`/inicio/${userId}`}>
                <img
                  className="w-14 h-14 rounded-full"
                  src={profilePhoto || "/profile-photo.png"}
                  alt={`${name} foto`}
                />
              </Link>
              <div>
                <Link to={`/inicio/${userId}`}>
                  <p className="font-bold mb-3">{name}</p>
                </Link>
                <p className="text-sm font-extralight">{coment}</p>
              </div>
            </div>
            <div className="w-full flex justify-end">
              <button
                onClick={() => setOpenReply(openReply === id ? null : id)}
                className="flex gap-2 items-center"
              >
                <FaReply />
                <p>Responder</p>
              </button>
            </div>

            {openReply === id && (
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
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="comentId" value={id} />
                <input type="hidden" name="intent" value="replyComent" />
                <button type="submit">
                  <img src="/send-icon.svg" alt="enviar" className="w-6" />
                </button>
              </replyFetcher.Form>
            )}
          </div>
          {/* Renderizar respuestas, si hay */}
          <div className="mb-3">
            {replys &&
              replys.length > 0 &&
              replys.map((reply, i) => (
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
                          src={reply.profilePhoto || "/profile-photo.png"}
                          alt={`${reply.name} foto`}
                        />
                      </Link>
                      <div>
                        <Link to={`/inicio/${reply.userId}`}>
                          <p className="font-bold mb-3">{reply.name}</p>
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
  );
}

export default function Post({
  data,
  numeroComentarios,
  postUser,
  isLiked,
  isSaved,
  coments,
}: PostProps) {
  const timeAgo = formatDistanceToNowStrict(data.createdAt, {
    locale: es,
  });

  const [imgIndex, setImgIndex] = useState<number>(0);
  const [coment, setComent] = useState<string>("");
  const [openComents, setOpenComents] = useState<boolean>(false);

  const userLoged = useRouteLoaderData<UserLoged>("routes/_private");

  const likeFetcher = useFetcher();
  const saveFetcher = useFetcher();
  const comentFetcher = useFetcher();

  useEffect(() => {
    if (comentFetcher.state === "idle") {
      setComent("");
    }
  }, [comentFetcher.state]);

  const optimisticLike = likeFetcher.formData
    ? likeFetcher.formData.get("like") === "like"
    : isLiked;

  const optimisticLikesCount = likeFetcher.formData
    ? likeFetcher.formData.get("like") === "like"
      ? data.likes + 1
      : data.likes - 1
    : data.likes;

  const optimisticSave = saveFetcher.formData
    ? saveFetcher.formData.get("save") === "save"
    : isSaved;

  return (
    <article className="w-[70%] bg-[#272727] p-6 rounded-xl">
      <div className="flex w-full justify-between items-center text-sm mb-8">
        <Link to={`/inicio/${postUser.id}`} className="flex items-center gap-3">
          <img
            src={postUser.profilePhoto || "/profile-photo.png"}
            alt="foto de perfil"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col text-sm">
            <p className="font-bold">{postUser.name || "Usuario"}</p>
            <p className="text-[#7D7D7D]">{postUser.category || "Categoría"}</p>
          </div>
        </Link>
        <p className="text-[#7D7D7D]">{`Hace ${timeAgo}`}</p>
      </div>

      <p className="mb-6 font-semibold">{data.title}</p>
      <p className="mb-6">{data.description}</p>

      {data.imgs && (
        <div className="w-full relative bg-[#1a1a1a] rounded-xl mb-6 overflow-hidden flex justify-center aspect-[16/9]">
          <img
            src={data.imgs[imgIndex]}
            alt="imagen del post"
            className="w-full h-full object-contain transition-opacity duration-500 opacity-0"
            onLoad={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          />
          {data.imgs.length > 1 && (
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
                  imgIndex === data.imgs.length - 1 ? "hidden" : ""
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
        <p
          onClick={() => setOpenComents(!openComents)}
          className={`font-extralight select-none ${
            numeroComentarios === 0 ? "" : "hover:underline cursor-pointer"
          }`}
        >
          {numeroComentarios !== 1
            ? `${numeroComentarios} comentarios`
            : `${numeroComentarios} comentario`}
        </p>
        <div className="flex gap-3">
          <likeFetcher.Form method="post">
            <input type="hidden" name="userId" value={userLoged?.uid} />
            <input type="hidden" name="postId" value={data.id} />
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
            <input type="hidden" name="postId" value={data.id} />
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

      {data.coments.length > 0 && userLoged && openComents && (
        <Coments coments={coments} userLoged={userLoged} postId={data.id} />
      )}

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
          value={coment}
          onChange={(e) => setComent(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
        <input type="hidden" name="userId" value={userLoged?.uid} />
        <input type="hidden" name="postId" value={data.id} />
        <input type="hidden" name="intent" value="replyPost" />
        <button type="submit">
          <img src="/send-icon.svg" alt="enviar" className="w-6" />
        </button>
      </comentFetcher.Form>
    </article>
  );
}
