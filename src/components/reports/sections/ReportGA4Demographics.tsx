"use client";

import type { GA4ReportData } from "@/lib/ga4/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ReportGA4DemographicsProps {
  data: GA4ReportData;
}

const GENDER_COLORS = ["#3B82F6", "#EC4899", "#9CA3AF"];
const AGE_COLOR = "#8B5CF6";

const genderLabels: Record<string, string> = {
  male: "Erkek",
  female: "Kadin",
  unknown: "Bilinmiyor",
};

export function ReportGA4Demographics({ data }: ReportGA4DemographicsProps) {
  const { demographics, devices, cities } = data;

  const genderData = demographics.gender.map((g) => ({
    name: genderLabels[g.label] || g.label,
    value: g.value,
  }));

  const totalGender = genderData.reduce((s, g) => s + g.value, 0);

  return (
    <div className="space-y-6">
      {/* Gender + Age Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Donut */}
        {genderData.length > 0 && (
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">Cinsiyet Dagilimi</h3>
            <div className="h-52 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                    itemStyle={{ color: "#D1D5DB" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {genderData.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                    <span className="text-gray-300 text-sm flex-1">{g.name}</span>
                    <span className="text-white text-sm font-medium">
                      {totalGender > 0 ? ((g.value / totalGender) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Age Distribution */}
        {demographics.ageGroup.length > 0 && (
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">Yas Dagilimi</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics.ageGroup} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                    itemStyle={{ color: "#D1D5DB" }}
                  />
                  <Bar dataKey="value" name="Kullanicilar" fill={AGE_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Devices + Cities Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Devices */}
        {devices.length > 0 && (
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">Cihaz Dagilimi</h3>
            <div className="space-y-3">
              {devices.map((d, i) => {
                const totalDeviceUsers = devices.reduce((s, dev) => s + dev.users, 0);
                const pct = totalDeviceUsers > 0 ? (d.users / totalDeviceUsers) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{d.device}</span>
                      <span className="text-white font-medium">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cities */}
        {cities.length > 0 && (
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-white font-semibold mb-4">Sehir Performansi</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium pb-2 text-xs">Sehir</th>
                    <th className="text-right text-gray-400 font-medium pb-2 text-xs">Kullanici</th>
                    <th className="text-right text-gray-400 font-medium pb-2 text-xs">Oturum</th>
                    <th className="text-right text-gray-400 font-medium pb-2 text-xs">Cikma %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {cities.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-300">{c.city === "(not set)" ? "Bilinmiyor" : c.city}</td>
                      <td className="py-2 text-white text-right">{c.users.toLocaleString("tr-TR")}</td>
                      <td className="py-2 text-gray-300 text-right">{c.sessions.toLocaleString("tr-TR")}</td>
                      <td className="py-2 text-gray-300 text-right">{c.bounceRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
