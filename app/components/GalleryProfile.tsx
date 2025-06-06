type props = {
  galleryUrls?: string[];
};

export default function GalleryProfile({ galleryUrls }: props) {
  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
      {galleryUrls?.map((url, index) => (
        <div
          key={index}
          className="bg-[#272727] rounded-lg aspect-[4/3] flex items-center justify-center overflow-hidden"
        >
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover transition-opacity duration-500 opacity-0"
            onLoad={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          />
        </div>
      ))}
    </div>
  );
}
