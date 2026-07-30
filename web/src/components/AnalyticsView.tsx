import React, { useMemo } from "react";
import { MovieItem } from "../types";
import { Film, Award, Building, PieChart, Layers } from "lucide-react";

interface AnalyticsViewProps {
  movies: MovieItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ movies }) => {
  // Compute metrics
  const totalCount = movies.length;

  const ratingCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movies) {
      const r = m.rating || "ไม่ระบุ";
      map.set(r, (map.get(r) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [movies]);

  const remarkCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movies) {
      const rm = m.remark || m.type || "อื่นๆ";
      map.set(rm, (map.get(rm) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [movies]);

  const topApplicants = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movies) {
      const app = m.applicant || "ไม่ระบุ";
      map.set(app, (map.get(app) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [movies]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ภาพยนตร์ผ่านการพิจารณาทั้งหมด
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalCount.toLocaleString()} รายการ
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ผู้ยื่นคำขอ/บริษัททั้งหมด
            </p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {new Set(movies.map((m) => m.applicant)).size.toLocaleString()} ราย
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              หมวดหมู่เรทติ้ง
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {ratingCounts.length} เรทติ้ง
            </p>
          </div>
        </div>
      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-amber-600" />
            <span>สัดส่วนเรทติ้ง (Rating Distribution)</span>
          </h3>

          <div className="space-y-3 pt-2">
            {ratingCounts.map(([rating, count]) => {
              const pct = Math.round((count / totalCount) * 100) || 0;
              return (
                <div key={rating} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{rating}</span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medium Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>สัดส่วนช่องทางเผยแพร่ (Medium Distribution)</span>
          </h3>

          <div className="space-y-3 pt-2">
            {remarkCounts.map(([remark, count]) => {
              const pct = Math.round((count / totalCount) * 100) || 0;
              return (
                <div key={remark} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{remark}</span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Applicants Leaderboard */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Building className="w-5 h-5 text-cyan-600" />
          <span>ผู้ยื่นขออนุญาตสูงสุด (Top Applicants)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {topApplicants.map(([applicant, count], idx) => (
            <div
              key={applicant}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-xs font-bold text-amber-700 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {applicant}
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg shrink-0">
                {count} เรื่อง
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
