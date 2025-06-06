import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { lazy, Suspense, useRef, useState, useCallback } from "react";
import { storage, db, auth } from "firebase/connection";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import imageCompression from "browser-image-compression";

const Cropper = lazy(() => import("react-easy-crop"));

type RouterLoaderData = {
  photoURL?: string;
  uid?: string;
};

export default function CompletarRegistro() {
  const userLoged = useRouteLoaderData<RouterLoaderData>("routes/_private");

  const [preview, setPreview] = useState<string | null>(null);
  const [openCropper, setOpenCropper] = useState<boolean>(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const croppedAreaPixelsRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
      setOpenCropper(true);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2D context");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  function dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  const handleCrop = async () => {
    if (preview && croppedAreaPixelsRef.current) {
      const cropped = await getCroppedImg(
        preview,
        croppedAreaPixelsRef.current
      );
      const originalBlob = dataURLtoBlob(cropped);

      if (!userLoged?.uid) return;

      const uid = userLoged.uid;
      const storageRef = ref(storage, `users/${uid}/profile.jpg`);

      try {
        setPreview(cropped);
        setOpenCropper(false);
        const originalFile = new File([originalBlob], "cropped.jpg", {
          type: originalBlob.type,
          lastModified: Date.now(),
        });

        const compressedBlob = await imageCompression(originalFile, {
          maxSizeMB: 0.3, // máximo 300 KB
          maxWidthOrHeight: 512, // escala si es más grande
          useWebWorker: true,
        });

        await uploadBytes(storageRef, compressedBlob);
        const url = await getDownloadURL(storageRef);

        await setDoc(
          doc(db, "users", userLoged.uid),
          { profilePhoto: url },
          { merge: true }
        );

        if (!auth.currentUser) return;
        await updateProfile(auth.currentUser, {
          photoURL: url,
        });

        console.log(auth.currentUser.photoURL);
      } catch (error) {
        return { error: error };
      }
    }
  };

  return (
    <main className="bg-[linear-gradient(180deg,_#F46868_0%,_#302B4F_100%)] h-screen text-white flex">
      <section className="w-1/2 h-screen justify-end flex items-center">
        <Outlet />
      </section>
      <section className="w-1/2 h-full flex flex-col justify-center pl-20">
        <div className="border-2 border-white rounded-xl w-2/3 relative flex flex-col items-center justify-center gap-6 h-[calc(30%+5rem)]">
          <p className="absolute -top-8 font-extralight left-0">
            Foto de perfil
          </p>

          {!openCropper && (
            <>
              <img
                className="h-36 w-36 object-cover rounded-full"
                src={preview ?? userLoged?.photoURL ?? "profile-photo.png"}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "/profile-photo.png";
                }}
                alt="Foto de perfil"
              />

              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer border-2 border-white rounded-xl w-2/4 flex justify-center py-2 items-center gap-2"
              >
                <img className="w-4" src="/upload-file.svg" alt="" />
                <span className="text-lg text-center font-light">
                  Subir archivo
                </span>
              </label>
            </>
          )}

          {openCropper && preview && (
            <Suspense fallback={<div>Cargando editor de imagen...</div>}>
              <div className="relative w-full h-full">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
                <button
                  onClick={handleCrop}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md text-xs"
                >
                  Elegir
                </button>
              </div>
            </Suspense>
          )}
        </div>
      </section>
    </main>
  );
}
