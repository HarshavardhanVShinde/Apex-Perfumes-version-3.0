export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-amber-400 opacity-20"></div>
        </div>
        <p className="text-slate-600 dark:text-gray-400 font-medium text-lg">Loading Aura Élixir...</p>
        <p className="text-slate-500 dark:text-gray-500 text-sm">Preparing your luxury fragrance experience</p>
      </div>
    </div>
  );
}
