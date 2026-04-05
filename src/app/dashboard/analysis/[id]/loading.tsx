export default function AnalysisLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Score + Summary skeleton */}
      <div className="h-32 bg-gray-200 rounded-xl" />

      {/* KPIs skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg w-80" />

      {/* Table skeleton */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
