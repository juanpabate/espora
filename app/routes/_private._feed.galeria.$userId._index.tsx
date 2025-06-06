import { useOutletContext, Await, useParams, Link } from "@remix-run/react";
import { Suspense } from "react";
import GalleryProfile from "~/components/GalleryProfile";
import GallerySkeleton from "~/components/GallerySkeleton";

type LoaderData = {
  gallery?: Promise<{ postId: string; url: string }[]>;
};

export default function Gallery() {
  const params = useParams();
  const { gallery } = useOutletContext<LoaderData>();

  return (
    <Suspense fallback={<GallerySkeleton />}>
      <Await resolve={gallery}>
        {(gallery) => (
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            {gallery?.map(({ postId, url }, index) => (
              <Link
                to={`/galeria/${params.userId}/${postId}`}
                key={`${postId}-${index}`}
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
              </Link>
            ))}
          </div>
        )}
      </Await>
    </Suspense>
  );
}
