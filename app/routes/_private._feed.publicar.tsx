import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import {
  lazy,
  Suspense,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { FaSearchPlus, FaExpand } from "react-icons/fa";
import { BsRecordFill } from "react-icons/bs";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { getCroppedImg } from "utils/cropImage";
import imageCompression from "browser-image-compression";
import type { ActionFunctionArgs } from "@remix-run/node";
import { adminAuth } from "firebase/admin";
import { userTokenCookie } from "utils/session";
import { db, storage } from "firebase/connection";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Cropper = lazy(() => import("react-easy-crop"));

type LoaderData = {
  photoURL?: string;
  category?: string;
  name?: string;
  uid: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const title = form.get("title")?.toString().trim();
  const description = form.get("description")?.toString().trim();
  const files = form.getAll("files") as File[];

  if (!title || !description)
    throw new Error("La publicación debe contener título y descripción");

  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = await userTokenCookie.parse(cookieHeader);

    if (!token) {
      throw new Error("Token inválido");
    }
    const decodedToken = await adminAuth.verifyIdToken(token);

    const sendPost = await addDoc(collection(db, "posts"), {
      title,
      description,
      userId: decodedToken.uid,
      createdAt: new Date(),
      imgs: [],
      likes: 0,
      saves: 0,
    });

    const urls: string[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(
          storage,
          `users/${decodedToken.uid}/posts/${sendPost.id}/${i}.jpg`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }

      await updateDoc(doc(db, "posts", sendPost.id), {
        imgs: urls,
      });
    }
    return null;
  } catch (error) {
    return { error: error };
  }
}

export default function Publicar() {
  const data = useRouteLoaderData<LoaderData>("routes/_private");

  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [openCroper, setOpenCropper] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [ratio, setRatio] = useState<number>(4 / 5);
  const [croppedAreas, setCroppedAreas] = useState<Record<number, any>>({});

  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: any) => {
      setCroppedAreas((prev) => ({
        ...prev,
        [previewIndex]: croppedAreaPixels,
      }));
    },
    [previewIndex]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const selected = Array.from(files);

    if (files.length > 5) {
      alert(`Solo puedes seleccionar hasta 5 archivos.`);
      e.target.value = "";
      return;
    }

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      initialQuality: 0.7,
      useWebWorker: true,
    };

    try {
      // Comprimir todos los archivos
      const compressedFilesPromises = Array.from(files).map(async (file) => {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
      });

      const compressedFiles = await Promise.all(compressedFilesPromises);

      setSelectedFiles(compressedFiles);
      setPreviewIndex(0);
      setOpenCropper(true);
    } catch (error) {
      console.error("Error al comprimir imágenes:", error);
    }
  };

  const saveCroppedImage = async (index: number) => {
    if (!selectedFiles[index]) return;
    try {
      const croppedBlob = await getCroppedImg(
        URL.createObjectURL(selectedFiles[index]),
        croppedAreas[index]
      );

      const fileName =
        selectedFiles[index].name.replace(/\.[^/.]+$/, "") + "_cropped.jpg";
      const file = new File([croppedBlob], fileName, { type: "image/jpeg" });

      const updatedFiles = [...selectedFiles];
      updatedFiles[index] = file;
      setSelectedFiles(updatedFiles);
    } catch (e) {
      console.error("Error al recortar la imagen", e);
    }
  };

  const handleCropConfirm = async () => {
    await saveCroppedImage(previewIndex);

    if (previewIndex < selectedFiles.length - 1) {
      setPreviewIndex(previewIndex + 1);
      setZoom(1);
    } else {
      setOpenPreview(true);
      setOpenCropper(false);
      setPreviewIndex(0);
    }
  };

  const currentFile = selectedFiles[previewIndex];

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!currentFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(currentFile);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    // Agrega los archivos seleccionados
    selectedFiles.forEach((file, index) => {
      formData.append("files", file, file.name);
    });

    // Enviar el formulario usando fetch
    const response = await fetch("/publicar", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("Enviado correctamente");
      navigate("/inicio");
      // Puedes redirigir o limpiar el formulario aquí
    } else {
      console.error("Error al enviar");
    }
  };

  return (
    <main className="p-8 h-screen overflow-scroll">
      <h2 className="text-2xl mb-4 font-bold">Publicar</h2>

      <div className="flex flex-col w-full h-[90%] items-center justify-center">
        {!openCroper && (
          <section className="w-[70%] bg-[#232323] h-fit rounded-3xl p-6 px-10 flex flex-col justify-center">
            <div className="flex w-full justify-center">
              <div className="flex gap-2 items-center">
                <img
                  src={data?.photoURL ? data?.photoURL : "/profile-photo.png"}
                  alt="Foto de perfil"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-xs text-gray-200/40">
                    {data?.category ? data.category.toUpperCase() : "NN"}
                  </p>
                  <p className="text-sm">
                    {data?.name
                      ? data.name.split(" ").slice(0, 2).join(" ")
                      : "NN"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-3">
              <p className="text-2xl font-light">Comparte tu creación</p>
            </div>

            <Form
              encType="multipart/form-data"
              ref={formRef}
              onSubmit={handleSubmit}
              method="post"
              className="w-full mt-8 flex flex-col"
            >
              <div className="flex w-full mb-4">
                <label htmlFor="title" className="text-2xl font-light w-[40%]">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#525252] rounded-md outline-none px-4"
                />
              </div>

              <div className="flex w-full mb-4">
                <label
                  htmlFor="Description"
                  className="w-[40%] text-2xl font-light"
                >
                  Descripción
                </label>
                <input
                  type="text"
                  id="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  name="description"
                  className="w-full bg-[#525252] rounded-md outline-none px-4"
                />
              </div>

              <div className="flex w-full">
                <p className="w-[40%] text-2xl font-light">Archivo</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  id="postFile"
                  onChange={handleFileChange}
                />
                <div
                  className={`w-full border-[1px] border-[#979797] rounded-lg min-h-52 flex flex-col items-center  ${
                    openCroper
                      ? "justify-end gap-10 pb-6"
                      : "justify-center gap-3 py-3"
                  }`}
                >
                  {!openPreview && (
                    <>
                      <div className="flex gap-3">
                        <img src="/picture-icon.svg" alt="" className="w-16" />
                        <img src="/music-icon.svg" alt="" className="w-16" />
                        <img src="/video-icon.svg" alt="" className="w-16" />
                      </div>

                      <label
                        htmlFor="postFile"
                        className="flex items-center gap-2 cursor-pointer border-[1px] border-[#979797] px-4 rounded-md font-light"
                      >
                        <img
                          src="/upload-file-gray.svg"
                          alt=""
                          className="w-4"
                        />
                        Subir archivo
                      </label>
                    </>
                  )}
                  {openPreview && (
                    <>
                      <p className="text-xs font-light">Vista previa</p>

                      <div className="w-56 min-h-56 rounded-md border-2 bg-[#D9D9D9] flex items-center relative">
                        <img
                          src={URL.createObjectURL(selectedFiles[previewIndex])}
                          alt={`Preview-${previewIndex}`}
                          className="w-full h-auto max-h-full object-cover rounded-md"
                        />

                        {selectedFiles.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewIndex((prev) =>
                                  prev > 0 ? prev - 1 : prev
                                )
                              }
                              className={`absolute top-[45%] -left-10 p-2 rounded-md ${
                                previewIndex === 0 ? "hidden" : ""
                              }`}
                            >
                              <FaChevronLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewIndex((prev) =>
                                  prev === selectedFiles.length - 1
                                    ? prev
                                    : prev + 1
                                )
                              }
                              className={`absolute top-[45%] -right-10 p-2 rounded-md ${
                                previewIndex === selectedFiles.length - 1
                                  ? "hidden"
                                  : ""
                              }`}
                            >
                              <FaChevronRight />
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewIndex(0);
                          setOpenPreview(false);
                          setOpenCropper(true);
                        }}
                        className="border-[1px] p-2 text-xs font-light rounded-md"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setTitle("");
                    setDescription("");
                    setOpenPreview(false);
                  }}
                  className="font-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="border-[1px] border-[#979797] rounded-md px-2"
                >
                  Publicar
                </button>
              </div>
            </Form>
          </section>
        )}

        {openCroper && preview && (
          <section className="w-[70%] h-[80%] bg-[#232323] rounded-3xl px-10 flex flex-col items-center select-none">
            <p className="text-xl mb-4 mt-10">Recortar imagen</p>

            <div className="w-full h-[70%] bg-[#979797] rounded-3xl overflow-hidden">
              <Suspense fallback={<div>Cargando editor de imagen...</div>}>
                <div className="relative w-full h-full">
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={ratio}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />

                  <div className="absolute bottom-2 left-6 flex gap-2">
                    <div className="flex">
                      {/* checkbox oculto */}
                      <input
                        type="checkbox"
                        id="toggleRange2"
                        className="peer hidden"
                      />

                      {/* el botón que actúa como label del checkbox */}
                      <label
                        htmlFor="toggleRange2"
                        className="bg-black p-2 rounded-md cursor-pointer inline-block"
                      >
                        <FaExpand />
                      </label>

                      {/* input range que aparece solo si el checkbox está activado */}
                      <div className="ml-2 transition-all duration-300 opacity-0 scale-0 peer-checked:opacity-100 flex flex-col rounded-md w-20 bg-black p-2 gap-2 font-extralight text-sm z-10 peer-checked:scale-100 absolute bottom-10 -left-2">
                        <button
                          className="border-[1px] w-8 h-8 rounded-md"
                          onClick={() => setRatio(1 / 1)}
                        >
                          1:1
                        </button>
                        <button
                          className="border-[1px] w-8 h-10 rounded-md"
                          onClick={() => setRatio(4 / 5)}
                        >
                          4:5
                        </button>
                        <button
                          className="border-[1px] w-12 h-8 rounded-md"
                          onClick={() => setRatio(16 / 9)}
                        >
                          16:9
                        </button>
                      </div>
                    </div>

                    <div className="left-12 flex">
                      {/* checkbox oculto */}
                      <input
                        type="checkbox"
                        id="toggleRange"
                        className="peer hidden"
                      />

                      {/* el botón que actúa como label del checkbox */}
                      <label
                        htmlFor="toggleRange"
                        className="bg-black p-2 rounded-md cursor-pointer inline-block"
                      >
                        <FaSearchPlus />
                      </label>

                      {/* input range que aparece solo si el checkbox está activado */}
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setZoom(Number(e.target.value))
                        }
                        className="ml-2 w-24 transition-all duration-300 opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100"
                      />
                    </div>
                  </div>

                  <div
                    className={`absolute flex gap-2 bottom-2 w-full justify-center pointer-events-none ${
                      selectedFiles.length === 1 ? "hidden" : ""
                    }`}
                  >
                    {selectedFiles.map((_, i) => (
                      <BsRecordFill
                        key={i}
                        className={
                          i === previewIndex ? "text-[#F27D7D]" : "text-white"
                        }
                      />
                    ))}
                  </div>

                  <button
                    className={`absolute top-[50%] left-6 p-2 bg-black rounded-md ${
                      previewIndex === 0 ? "hidden" : ""
                    }`}
                    onClick={() => {
                      setPreviewIndex((prev) => (prev > 0 ? prev - 1 : prev));
                      setZoom(1);
                    }}
                  >
                    <FaChevronLeft />
                  </button>

                  <button
                    className={`absolute top-[50%] right-6 p-2 bg-black rounded-md ${
                      previewIndex === selectedFiles.length - 1 ? "hidden" : ""
                    } `}
                    onClick={async () => {
                      if (previewIndex < selectedFiles.length - 1) {
                        await saveCroppedImage(previewIndex);
                        setPreviewIndex((prev) => prev + 1);
                        setZoom(1);
                      }
                    }}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </Suspense>
            </div>
            <div className="w-full flex justify-end gap-3 mt-4">
              <button
                className="font-light"
                onClick={() => {
                  setOpenCropper(false);
                  setSelectedFiles([]);
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCropConfirm}
                className="border-[1px] border-[#979797] rounded-md px-2"
              >
                {previewIndex === selectedFiles.length - 1
                  ? "Finalizar"
                  : "Siguiente"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
