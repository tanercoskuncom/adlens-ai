"use client";

interface ReportSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function ReportSectionHeader({ title, subtitle, icon }: ReportSectionHeaderProps) {
  return (
    <div className="report-section bg-gray-900 rounded-xl p-8 flex items-center gap-4">
      {icon && (
        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
