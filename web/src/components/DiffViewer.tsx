import React, { useState, useMemo } from "react";
import { GitCommit, DiffSummary, MovieItem } from "../types";
import {
  GitCommit as GitCommitIcon,
  Clock,
  PlusCircle,
  RefreshCw,
  MinusCircle,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
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

const THAI_MONTH_ABBR = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

function formatThaiDateTime(dateIsoStr: string): { full: string; relative: string } {
  if (!dateIsoStr) return { full: "-", relative: "-" };
  const d = new Date(dateIsoStr);
  if (isNaN(d.getTime())) return { full: dateIsoStr, relative: "-" };

  const day = d.getDate();
  const month = THAI_MONTH_ABBR[d.getMonth()];
  const yearBE = d.getFullYear() + 543;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const full = `${day} ${month} ${yearBE} เวลา ${hours}:${minutes} น.`;

  // Calculate relative time
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relative = "";
  if (diffSec < 60) relative = "เมื่อกี้";
  else if (diffMin < 60) relative = `${diffMin} นาทีที่แล้ว`;
  else if (diffHour < 24) relative = `${diffHour} ชั่วโมงที่แล้ว`;
  else if (diffDay === 1) relative = "เมื่อวานนี้";
  else if (diffDay < 30) relative = `${diffDay} วันที่แล้ว`;
  else relative = `${Math.floor(diffDay / 30)} เดือนที่แล้ว`;

  return { full, relative };
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

  // Indices in commits array (commits[0] is newest, commits[len-1] is oldest)
  const indexOld = useMemo(
    () => commits.findIndex((c) => c.sha === selectedOldSha),
    [commits, selectedOldSha]
  );
  const indexNew = useMemo(
    () => commits.findIndex((c) => c.sha === selectedNewSha),
    [commits, selectedNewSha]
  );

  // Handle Baseline change with auto-adjustment to ensure Baseline is ALWAYS BEFORE Target
  const handleBaselineChange = (newOldSha: string) => {
    const newIndexOld = commits.findIndex((c) => c.sha === newOldSha);
    onSelectOldSha(newOldSha);

    // Baseline must be older (greater index in array) than Target
    if (newIndexOld !== -1 && indexNew !== -1 && newIndexOld <= indexNew) {
      // Auto adjust Target to a newer commit (index 0 or indexOld - 1)
      const adjustedNewIndex = Math.max(0, newIndexOld - 1);
      if (adjustedNewIndex !== indexNew && commits[adjustedNewIndex]) {
        onSelectNewSha(commits[adjustedNewIndex].sha);
      }
    }
  };

  // Handle Target change with auto-adjustment to ensure Baseline is ALWAYS BEFORE Target
  const handleTargetChange = (newNewSha: string) => {
    const newIndexNew = commits.findIndex((c) => c.sha === newNewSha);
    onSelectNewSha(newNewSha);

    // Target must be newer (smaller index in array) than Baseline
    if (newIndexNew !== -1 && indexOld !== -1 && newIndexNew >= indexOld) {
      // Auto adjust Baseline to an older commit (commits.length - 1 or newIndexNew + 1)
      const adjustedOldIndex = Math.min(commits.length - 1, newIndexNew + 1);
      if (adjustedOldIndex !== indexOld && commits[adjustedOldIndex]) {
        onSelectOldSha(commits[adjustedOldIndex].sha);
      }
    }
  };

  // Handle node click on timeline track
  const handleNodeClick = (clickedIndex: number, sha: string) => {
    if (sha === selectedOldSha || sha === selectedNewSha) return;

    // If clicked node is older than Target (greater index than Target), set as Baseline
    if (indexNew !== -1 && clickedIndex > indexNew) {
      onSelectOldSha(sha);
    } else {
      // Otherwise set as Target
      onSelectNewSha(sha);
    }
  };

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
      {/* TIMELINE STYLE TOP SELECTOR PANEL */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>เลือกช่วงเวลาเปลี่ยนแปลงบน Timeline (Chronological Timeline Selector)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบบังคับให้เวอร์ชันตั้งต้น (Baseline) เกิดก่อนเวอร์ชันเปรียบเทียบ (Target) เสมอ
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg shrink-0">
            <span>{commits.length} Timed Snapshots</span>
          </div>
        </div>

        {/* Visual Horizontal Timeline Nodes Track */}
        <div className="relative pt-2 pb-4">
          <div className="text-xs font-semibold text-slate-600 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>เส้นเวลาประวัติการอัปเดต (คลิก Node เพื่อเลือกเวอร์ชัน):</span>
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              ◄ เก่ากว่า (Baseline) ------------ ใหม่กว่า (Target) ►
            </span>
          </div>

          <div className="relative py-2">
            {/* Continuous Line passing through exact center of circle nodes */}
            <div className="absolute top-[10px] left-6 right-6 h-0.5 bg-amber-400 z-0"></div>

            <div className="relative z-10 flex items-start justify-between overflow-x-auto pb-4 pt-0 px-2 gap-8 no-scrollbar">
              {/* Render timeline nodes chronologically: Oldest (left) to Newest (right) */}
              {[...commits].reverse().map((c) => {
                const originalIndex = commits.findIndex((item) => item.sha === c.sha);
                const { full, relative } = formatThaiDateTime(c.commit.author.date);
                const isOld = selectedOldSha === c.sha;
                const isNew = selectedNewSha === c.sha;

                return (
                  <div
                    key={`node-${c.sha}`}
                    className="flex flex-col items-center shrink-0 space-y-2 group cursor-pointer"
                    onClick={() => handleNodeClick(originalIndex, c.sha)}
                  >
                    {/* Timeline Circle Dot */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                        isOld
                          ? "bg-amber-500 border-white ring-4 ring-amber-200 shadow-md scale-110"
                          : isNew
                          ? "bg-blue-600 border-white ring-4 ring-blue-200 shadow-md scale-110"
                          : "bg-white border-slate-400 group-hover:border-amber-500 group-hover:scale-105"
                      }`}
                    >
                      {(isOld || isNew) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>

                    {/* Badge & Date/Time label */}
                    <div className="text-center space-y-0.5 pt-1">
                      {isOld && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded block shadow-2xs">
                          1. Baseline (ตั้งต้น)
                        </span>
                      )}
                      {isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded block shadow-2xs">
                          2. Target (เปรียบเทียบ)
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-800 block whitespace-nowrap">
                        {full.split(" เวลา")[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block whitespace-nowrap">
                        {full.includes("เวลา") ? "เวลา " + full.split("เวลา ")[1] : ""}
                      </span>
                      <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                        ({relative})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dropdown Selectors with Formatted Thai Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 items-center">
          {/* Baseline Version Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>1. เวอร์ชันตั้งต้น (Baseline - ต้องเกิดก่อน):</span>
            </label>
            <select
              value={selectedOldSha}
              onChange={(e) => handleBaselineChange(e.target.value)}
              className="w-full h-[40px] px-3 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer font-medium"
            >
              {commits.map((c, i) => {
                const { full, relative } = formatThaiDateTime(c.commit.author.date);
                const isTarget = c.sha === selectedNewSha;
                const isAfterTarget = indexNew !== -1 && i <= indexNew;

                return (
                  <option
                    key={`old-${c.sha}`}
                    value={c.sha}
                    disabled={isTarget}
                  >
                    📅 {full} ({relative}) {isAfterTarget ? "⚠️ (เกิดขึ้นหลัง Target)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Target Version Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>2. เวอร์ชันล่าสุด / เปรียบเทียบ (Target - ต้องเกิดหลัง):</span>
            </label>
            <select
              value={selectedNewSha}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="w-full h-[40px] px-3 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer font-medium"
            >
              {commits.map((c, i) => {
                const { full, relative } = formatThaiDateTime(c.commit.author.date);
                const isBaseline = c.sha === selectedOldSha;
                const isBeforeBaseline = indexOld !== -1 && i >= indexOld;

                return (
                  <option
                    key={`new-${c.sha}`}
                    value={c.sha}
                    disabled={isBaseline}
                  >
                    📅 {full} ({relative}) {isBeforeBaseline ? "⚠️ (เกิดขึ้นก่อน Baseline)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 bg-white">
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
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "added"
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  เพิ่มใหม่ (Added)
                </span>
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                +{diffSummary.added.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("updated")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "updated"
                  ? "border-amber-500 bg-amber-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-amber-400"
              }`}
            >
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  แก้ไข (Updated)
                </span>
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">
                {diffSummary.updated.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("removed")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "removed"
                  ? "border-red-500 bg-red-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-red-400"
              }`}
            >
              <div className="flex items-center justify-between text-red-700">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  ลบออก (Removed)
                </span>
                <MinusCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-red-600 mt-2">
                -{diffSummary.removed.length}
              </p>
            </div>

            <div
              onClick={() => setFilterType("all")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                filterType === "all"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  คงเดิม (Unchanged)
                </span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">
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
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
              </span>
              {(["all", "added", "updated", "removed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    filterType === t
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
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
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 space-y-2 bg-white">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-base font-semibold text-slate-900">
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
                    className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-md shrink-0">
                        + เพิ่มใหม่
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                          <span>ใบอนุญาต: {item.license_no}</span>
                          <span>•</span>
                          <span>เรท: {item.rating}</span>
                          <span>•</span>
                          <span>ประเภท: {item.type} ({item.remark})</span>
                          <span>•</span>
                          <span>วันที่: {item.approved_date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          ผู้ยื่นคำขอ: {item.applicant}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewDetail(item)}
                      className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center space-x-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>ดูรายละเอียด</span>
                    </button>
                  </div>
                ))}

              {/* UPDATED ITEMS LIST */}
              {(filterType === "all" || filterType === "updated") &&
                filteredUpdated.map((u, idx) => (
                  <div
                    key={`updated-${idx}`}
                    className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-md">
                          ✎ แก้ไขข้อมูล
                        </span>
                        <h4 className="font-bold text-slate-900">
                          {u.newItem.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onViewDetail(u.newItem)}
                        className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-2xs flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-500 block mb-1 font-semibold">
                          ข้อมูลเดิม (Old):
                        </span>
                        {u.changedFields.map((field) => (
                          <div key={`old-${field}`} className="text-slate-500 line-through">
                            <span className="text-slate-400">{field}:</span>{" "}
                            {u.oldItem[field] || "-"}
                          </div>
                        ))}
                      </div>

                      <div>
                        <span className="text-amber-800 block mb-1 font-semibold">
                          ข้อมูลใหม่ (New):
                        </span>
                        {u.changedFields.map((field) => (
                          <div key={`new-${field}`} className="text-amber-900 font-medium">
                            <span className="text-amber-700">{field}:</span>{" "}
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
                    className="p-4 rounded-xl border border-red-300 bg-red-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-md shrink-0">
                        - ลบออก
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-600 line-through">
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
