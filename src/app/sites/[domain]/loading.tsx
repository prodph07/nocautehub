export default function TenantSiteLoading() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 animate-pulse">
      {/* Navbar Skeleton */}
      <div className="h-16 sm:h-20 border-b border-white/10 bg-[#141417]/80 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="space-y-1.5">
            <div className="w-36 h-4 rounded bg-white/10" />
            <div className="w-24 h-2.5 rounded bg-white/5" />
          </div>
        </div>
        <div className="w-28 h-10 rounded-xl bg-white/10" />
      </div>

      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-6">
        <div className="w-48 h-7 rounded-full bg-white/10" />
        <div className="space-y-3 max-w-2xl">
          <div className="w-full h-12 rounded-xl bg-white/10" />
          <div className="w-4/5 h-12 rounded-xl bg-white/10" />
        </div>
        <div className="w-full max-w-xl h-16 rounded-xl bg-white/5" />
        <div className="flex gap-3 pt-2">
          <div className="w-64 h-14 rounded-xl bg-white/15" />
          <div className="w-36 h-14 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Authority Bar Skeleton */}
      <div className="border-y border-white/10 bg-[#111113] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-8 rounded bg-white/10" />
              <div className="w-32 h-3 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

