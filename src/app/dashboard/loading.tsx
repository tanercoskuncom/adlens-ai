export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-gray-200 rounded-xl" />

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 bg-gray-200 rounded-xl" />

      {/* List skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
