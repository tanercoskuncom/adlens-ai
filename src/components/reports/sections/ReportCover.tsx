"use client";

interface ReportCoverProps {
  clientName: string;
  dateRange?: string;
  agencyName?: string;
}

export function ReportCover({ clientName, dateRange, agencyName = "AdLens AI" }: ReportCoverProps) {
  return (
    <div className="report-section bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-12 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">{agencyName}</span>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Performans Raporu
        </h1>
        <div className="w-20 h-1 bg-blue-500 rounded-full" />
        <h2 className="text-2xl text-blue-400 font-semibold">{clientName}</h2>
        {dateRange && (
          <p className="text-gray-400 text-lg">{dateRange}</p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between pt-8 border-t border-gray-700/50">
        <span className="text-gray-500 text-sm">
          {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="text-gray-500 text-sm">Gizli - Sadece Dahili Kullanım</span>
      </div>
    </div>
  );
}
