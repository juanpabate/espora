export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any
): Promise<Blob> {
  const image = await createImage(imageSrc);

  // Tamaño natural de la imagen
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  // Tamaño que se muestra en pantalla (el contenedor donde está el crop)
  const displayedWidth = image.width;
  const displayedHeight = image.height;

  // Calcular escalas
  const scaleX = naturalWidth / displayedWidth;
  const scaleY = naturalHeight / displayedHeight;

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas.");

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject("No se pudo crear el blob");
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // Importante para imágenes locales
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}
