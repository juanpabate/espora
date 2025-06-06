export default function PostSkeleton() {
  return (
    <article className="w-[70%] bg-[#272727] p-6 rounded-xl animate-pulse">
      <div className="flex w-full justify-between items-center text-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
          <div className="flex flex-col text-sm">
            <div className="h-4 bg-gray-400 rounded w-3/5 mb-1"></div>
            <div className="h-4 bg-gray-400 rounded w-2/5"></div>
          </div>
        </div>
        <div className="w-24 h-4 bg-gray-400 rounded"></div>
      </div>
      <div className="h-4 bg-gray-400 rounded w-4/5 mb-6"></div>
      <div className="h-4 bg-gray-400 rounded w-full mb-6"></div>
      <div className="w-full h-80 bg-gray-300 rounded-xl mb-6"></div>
      <div className="flex w-full justify-between mb-6">
        <div className="h-4 bg-gray-400 rounded w-1/5"></div>
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      <div className="flex w-full gap-2 border-[1px] border-gray-400 rounded-xl p-2 items-center">
        <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
        <div className="w-full h-6 bg-gray-400 rounded"></div>
        <div className="w-6 h-6 bg-gray-400 rounded"></div>
      </div>
    </article>
  );
}
