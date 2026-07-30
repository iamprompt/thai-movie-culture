import React, { useState, useMemo } from "react";
import { GitCommit, DiffSummary, MovieItem } from "../types";
import {
  GitCommit as GitCommitIcon,
  PlusCircle,
  RefreshCw,
  MinusCircle,
  CheckCircle2,
  Search,
  Filter,
  Eye,
} from "lucide-react";

interface DiffViewerProps {
  commits: GitCommit[];
  selectedOldSha: string;
  selectedNewSha: string;
  onSelectOldSha: (sha: string) => void;
  onSelectNewSha: (sha: string) => void;
  diffSummary: DiffSummary | null;
  isLoading: boolean;
  onViewDetail: (movie: MovieItem) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  commits,
  selectedOldSha,
  selectedNewSha,
  onSelectOldSha,
  onSelectNewSha,
  diffSummary,
  isLoading,
  onViewDetail,
}) => {
  const [filterType, setFilterType] = useState<
    "all" | "added" | "updated" | "removed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAdded = useMemo(() => {
    if (!diffSummary) return [];
    return diffSummary.added.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [diffSummary, searchQuery]);

  const filteredUpdated = useMemo(() => {
    if (!diffSummary) return [];
    return diffSummary.updated.filter(
      (u) =>
        u.newItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.newItem.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.newItem.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [diffSummary, searchQuery]);

  const filteredRemoved = useMemo(() => {
    if (!diffSummary) return [];
    return diffSummary.removed.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [diffSummary, searchQuery]);

  const totalDiffCount =
    (diffSummary?.added.length || 0) +
    (diffSummary?.updated.length || 0) +
    (diffSummary?.removed.length || 0);

  return (
    <div className="space-y-6">
      {/* Commit Selector Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center space-x-2">
          <GitCommitIcon className="w-5 h-5 text-amber-400" />
          <span>เลือกเวอร์ชันเพื่อเปรียบเทียบความเปลี่ยนแปลง (Commit Comparison)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Baseline Version */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              เวอร์ชันตั้งต้น (Baseline Version):
            </label>
            <select
              value={selectedOldSha}
              onChange={(e) => onSelectOldSha(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {commits.map((c) => (
                <option key={`old-${c.sha}`} value={c.sha}>
                  {c.sha.substring(0, 7)} — {c.commit.message.split("\n")[0]} (
                  {new Date(c.commit.author.date).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>

          {/* Target Version */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              เวอร์ชันล่าสุด / เปรียบเทียบ (Target Version):
            </label>
            <select
              value={selectedNewSha}
              onChange={(e) => onSelectNewSha(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {commits.map((c) => (
                <option key={`new-${c.sha}`} value={c.sha}>
                  {c.sha.substring(0, 7)} — {c.commit.message.split("\n")[0]} (
                  {new Date(c.commit.author.date).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">กำลังโหลดข้อมูลเปรียบเทียบจาก GitHub...</p>
        </div>
      )}

      {!isLoading && diffSummary && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setFilterType("added")}
              className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "added"
                  ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  : "border-slate-800 hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  เพิ่มใหม่ (Added)
                </span>
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-emerald-300 mt-2">
                +{diffSummary.added.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("updated")}
              className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "updated"
                  ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                  : "border-slate-800 hover:border-amber-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  แก้ไข (Updated)
                </span>
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-amber-300 mt-2">
                {diffSummary.updated.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("removed")}
              className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "removed"
                  ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10"
                  : "border-slate-800 hover:border-red-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-red-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  ลบออก (Removed)
                </span>
                <MinusCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-red-300 mt-2">
                -{diffSummary.removed.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("all")}
              className={`glass-panel p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "all"
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 hover:border-blue-500/40"
              }`}
            >
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  คงเดิม (Unchanged)
                </span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-300 mt-2">
                {diffSummary.unchangedCount}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อเรื่อง/ใบอนุญาต/ผู้ยื่น..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
              </span>
              {(["all", "added", "updated", "removed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    filterType === t
                      ? "bg-slate-700 text-white border-slate-500"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {t === "all"
                    ? `ทั้งหมด (${totalDiffCount})`
                    : t === "added"
                    ? `เพิ่มใหม่ (+${diffSummary.added.length})`
                    : t === "updated"
                    ? `แก้ไข (${diffSummary.updated.length})`
                    : `ลบออก (-${diffSummary.removed.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Diff Content Results */}
          {totalDiffCount === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-base font-semibold text-slate-200">
                ไม่พบความเปลี่ยนแปลงระหว่าง 2 เวอร์ชันนี้ (Datasets match 100%)
              </p>
              <p className="text-xs text-slate-500">
                รายการภาพยนตร์และข้อมูลทั้งหมดตรงกันทุกประการ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ADDED ITEMS LIST */}
              {(filterType === "all" || filterType === "added") &&
                filteredAdded.map((item, idx) => (
                  <div
                    key={`added-${idx}`}
                    className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 shrink-0">
                        + เพิ่มใหม่
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-100">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>ใบอนุญาต: {item.license_no}</span>
                          <span>•</span>
                          <span>เรท: {item.rating}</span>
                          <span>•</span>
                          <span>ประเภท: {item.type} ({item.remark})</span>
                          <span>•</span>
                          <span>วันที่: {item.approved_date}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          ผู้ยื่นคำขอ: {item.applicant}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewDetail(item)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center justify-center space-x-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูรายละเอียด</span>
                    </button>
                  </div>
                ))}

              {/* UPDATED ITEMS LIST */}
              {(filterType === "all" || filterType === "updated") &&
                filteredUpdated.map((u, idx) => (
                  <div
                    key={`updated-${idx}`}
                    className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                          ✎ แก้ไขข้อมูล
                        </span>
                        <h4 className="font-bold text-slate-100">
                          {u.newItem.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onViewDetail(u.newItem)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block mb-1 font-semibold">
                          ข้อมูลเดิม (Old):
                        </span>
                        {u.changedFields.map((field) => (
                          <div key={`old-${field}`} className="text-slate-400 line-through">
                            <span className="text-slate-500">{field}:</span>{" "}
                            {u.oldItem[field] || "-"}
                          </div>
                        ))}
                      </div>

                      <div>
                        <span className="text-amber-400 block mb-1 font-semibold">
                          ข้อมูลใหม่ (New):
                        </span>
                        {u.changedFields.map((field) => (
                          <div key={`new-${field}`} className="text-amber-200 font-medium">
                            <span className="text-amber-400/70">{field}:</span>{" "}
                            {u.newItem[field] || "-"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              {/* REMOVED ITEMS LIST */}
              {(filterType === "all" || filterType === "removed") &&
                filteredRemoved.map((item, idx) => (
                  <div
                    key={`removed-${idx}`}
                    className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="px-2 py-1 text-xs font-bold bg-red-500/20 text-red-300 rounded-md border border-red-500/30 shrink-0">
                        - ลบออก
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-300 line-through">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          ใบอนุญาต: {item.license_no} • ผู้ยื่น: {item.applicant}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
