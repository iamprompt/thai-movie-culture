import React, { useState, useEffect, useMemo } from "react";
import { GitCommit, DiffSummary, MovieItem } from "../types";
import { fetchMovieDataset, computeDiff } from "../services/github";
import {
  GitCommit as GitCommitIcon,
  Clock,
  Calendar,
  PlusCircle,
  RefreshCw,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  Filter,
  ArrowRightLeft,
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

// Thai month dictionary for date formatting
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
  const [expandedSha, setExpandedSha] = useState<string | null>(null);
  const [commitDiffs, setCommitDiffs] = useState<Record<string, DiffSummary>>({});
  const [loadingSha, setLoadingSha] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "added" | "updated" | "removed">("all");
  const [showCustomRangeSelect, setShowCustomRangeSelect] = useState(false);

  // Pre-load diffs for consecutive commits to display inline stats on timeline
  useEffect(() => {
    async function loadTimelineDiffs() {
      if (commits.length < 2) return;

      const diffsMap: Record<string, DiffSummary> = {};
      // Fetch datasets for latest commits
      for (let i = 0; i < Math.min(commits.length - 1, 5); i++) {
        const newCommit = commits[i];
        const prevCommit = commits[i + 1];
        try {
          const [prevData, newData] = await Promise.all([
            fetchMovieDataset(prevCommit.sha),
            fetchMovieDataset(newCommit.sha),
          ]);
          diffsMap[newCommit.sha] = computeDiff(prevData, newData);
        } catch (e) {
          console.error(`Failed to prefetch diff for commit ${newCommit.sha}`, e);
        }
      }
      setCommitDiffs(diffsMap);
    }

    loadTimelineDiffs();
  }, [commits]);

  // Handle expanding a timeline item to view its commit diff
  const toggleExpandCommit = async (sha: string, index: number) => {
    if (expandedSha === sha) {
      setExpandedSha(null);
      return;
    }

    setExpandedSha(sha);

    // If diff is not cached yet, fetch it
    if (!commitDiffs[sha] && index < commits.length - 1) {
      setLoadingSha(sha);
      try {
        const prevSha = commits[index + 1].sha;
        const [prevData, newData] = await Promise.all([
          fetchMovieDataset(prevSha),
          fetchMovieDataset(sha),
        ]);
        const summary = computeDiff(prevData, newData);
        setCommitDiffs((prev) => ({ ...prev, [sha]: summary }));
      } catch (err) {
        console.error("Error loading commit diff:", err);
      } finally {
        setLoadingSha(null);
      }
    }
  };

  const activeDiff = expandedSha ? commitDiffs[expandedSha] : diffSummary;

  const filteredAdded = useMemo(() => {
    if (!activeDiff) return [];
    return activeDiff.added.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDiff, searchQuery]);

  const filteredUpdated = useMemo(() => {
    if (!activeDiff) return [];
    return activeDiff.updated.filter(
      (u) =>
        u.newItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.newItem.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.newItem.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDiff, searchQuery]);

  const filteredRemoved = useMemo(() => {
    if (!activeDiff) return [];
    return activeDiff.removed.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applicant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDiff, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header & Mode Toggle */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-amber-600" />
            <span>ประวัติความเปลี่ยนแปลง (Timeline History)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            แสดงประวัติการอัปเดตข้อมูลภาพยนตร์และวีดิทัศน์ที่ผ่านการพิจารณาตามลำดับเวลา
          </p>
        </div>

        <button
          onClick={() => setShowCustomRangeSelect((prev) => !prev)}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-600" />
          <span>
            {showCustomRangeSelect ? "ซ่อนการเลือกช่วงเวอร์ชัน" : "เลือก 2 เวอร์ชันเทียบตรง"}
          </span>
        </button>
      </div>

      {/* Optional Custom Range Selector Dropdowns */}
      {showCustomRangeSelect && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm space-y-3 animate-fade-in">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            เลือก 2 เวอร์ชันเพื่อเปรียบเทียบข้ามช่วงเวลา:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                เวอร์ชันเดิม (Baseline):
              </label>
              <select
                value={selectedOldSha}
                onChange={(e) => onSelectOldSha(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {commits.map((c) => (
                  <option key={`old-${c.sha}`} value={c.sha}>
                    {c.sha.substring(0, 7)} — {c.commit.message.split("\n")[0]} (
                    {formatThaiDateTime(c.commit.author.date).full})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                เวอร์ชันใหม่ (Target):
              </label>
              <select
                value={selectedNewSha}
                onChange={(e) => onSelectNewSha(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {commits.map((c) => (
                  <option key={`new-${c.sha}`} value={c.sha}>
                    {c.sha.substring(0, 7)} — {c.commit.message.split("\n")[0]} (
                    {formatThaiDateTime(c.commit.author.date).full})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE LIST */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-amber-400 space-y-6">
        {commits.map((commit, idx) => {
          const { full, relative } = formatThaiDateTime(commit.commit.author.date);
          const isExpanded = expandedSha === commit.sha;
          const inlineSummary = commitDiffs[commit.sha];
          const isLatest = idx === 0;

          return (
            <div key={commit.sha} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 ${
                  isLatest
                    ? "bg-amber-500 border-white shadow-md ring-4 ring-amber-200"
                    : "bg-white border-amber-500 group-hover:bg-amber-400"
                } transition-all`}
              />

              {/* Timeline Card Container */}
              <div
                className={`glass-panel rounded-2xl border transition-all bg-white shadow-sm ${
                  isExpanded
                    ? "border-amber-400 ring-2 ring-amber-200/50"
                    : "border-slate-200 hover:border-amber-300"
                }`}
              >
                {/* Timeline Header Row */}
                <div
                  onClick={() => toggleExpandCommit(commit.sha, idx)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isLatest && (
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-md uppercase tracking-wider">
                          Latest Update
                        </span>
                      )}
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        #{commit.sha.substring(0, 7)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {full}
                      </span>
                      <span className="text-xs text-slate-400">({relative})</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {commit.commit.message.split("\n")[0]}
                    </h3>
                  </div>

                  {/* Inline Stats Badges & Expand Indicator */}
                  <div className="flex items-center space-x-3 shrink-0">
                    {inlineSummary ? (
                      <div className="flex items-center space-x-1.5 text-xs font-semibold">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-md">
                          +{inlineSummary.added.length}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-md">
                          ✎ {inlineSummary.updated.length}
                        </span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-300 rounded-md">
                          -{inlineSummary.removed.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        {idx === commits.length - 1 ? "Initial Release" : "คลิกเพื่อดูรายละเอียด"}
                      </span>
                    )}

                    <div className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Inline Detail View */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 bg-slate-50/50 rounded-b-2xl space-y-4 animate-fade-in">
                    {loadingSha === commit.sha ? (
                      <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>กำลังคำนวณความเปลี่ยนแปลงของเวอร์ชันนี้...</span>
                      </div>
                    ) : activeDiff ? (
                      <>
                        {/* Stat Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div
                            onClick={() => setFilterType("added")}
                            className={`p-3 rounded-xl border cursor-pointer ${
                              filterType === "added"
                                ? "border-emerald-500 bg-emerald-50 shadow-xs"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="text-xs font-semibold text-emerald-700 uppercase">
                              + เพิ่มใหม่
                            </span>
                            <p className="text-xl font-bold text-emerald-600 mt-1">
                              +{activeDiff.added.length}
                            </p>
                          </div>

                          <div
                            onClick={() => setFilterType("updated")}
                            className={`p-3 rounded-xl border cursor-pointer ${
                              filterType === "updated"
                                ? "border-amber-500 bg-amber-50 shadow-xs"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="text-xs font-semibold text-amber-700 uppercase">
                              ✎ แก้ไข
                            </span>
                            <p className="text-xl font-bold text-amber-600 mt-1">
                              {activeDiff.updated.length}
                            </p>
                          </div>

                          <div
                            onClick={() => setFilterType("removed")}
                            className={`p-3 rounded-xl border cursor-pointer ${
                              filterType === "removed"
                                ? "border-red-500 bg-red-50 shadow-xs"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="text-xs font-semibold text-red-700 uppercase">
                              - ลบออก
                            </span>
                            <p className="text-xl font-bold text-red-600 mt-1">
                              -{activeDiff.removed.length}
                            </p>
                          </div>

                          <div
                            onClick={() => setFilterType("all")}
                            className={`p-3 rounded-xl border cursor-pointer ${
                              filterType === "all"
                                ? "border-blue-500 bg-blue-50 shadow-xs"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="text-xs font-semibold text-blue-700 uppercase">
                              คงเดิม
                            </span>
                            <p className="text-xl font-bold text-slate-700 mt-1">
                              {activeDiff.unchangedCount}
                            </p>
                          </div>
                        </div>

                        {/* Search Filter for Expanded View */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="ค้นหารายการความเปลี่ยนแปลงในเวอร์ชันนี้..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* List of Added / Updated / Removed Movies */}
                        <div className="space-y-3 pt-2">
                          {/* Added */}
                          {(filterType === "all" || filterType === "added") &&
                            filteredAdded.map((item, i) => (
                              <div
                                key={`add-${i}`}
                                className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-emerald-800 mr-2">
                                    + [เพิ่ม]
                                  </span>
                                  <strong className="text-slate-900">{item.title}</strong>
                                  <span className="text-slate-600 ml-2">
                                    ({item.license_no} • {item.rating} • {item.applicant})
                                  </span>
                                </div>
                                <button
                                  onClick={() => onViewDetail(item)}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 shadow-2xs shrink-0 cursor-pointer"
                                >
                                  ดูข้อมูล
                                </button>
                              </div>
                            ))}

                          {/* Updated */}
                          {(filterType === "all" || filterType === "updated") &&
                            filteredUpdated.map((u, i) => (
                              <div
                                key={`upd-${i}`}
                                className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-amber-800 mr-2">
                                      ✎ [แก้ไข]
                                    </span>
                                    <strong className="text-slate-900">
                                      {u.newItem.title}
                                    </strong>
                                  </div>
                                  <button
                                    onClick={() => onViewDetail(u.newItem)}
                                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 shadow-2xs shrink-0 cursor-pointer"
                                  >
                                    ดูข้อมูล
                                  </button>
                                </div>
                                <div className="text-slate-600 pl-4 border-l-2 border-amber-400 space-y-1">
                                  {u.changedFields.map((field) => (
                                    <div key={`field-${field}`}>
                                      <span className="font-semibold text-slate-700">
                                        {field}:
                                      </span>{" "}
                                      <span className="line-through text-slate-400 mr-1">
                                        {u.oldItem[field]}
                                      </span>{" "}
                                      <span className="text-amber-900 font-medium">
                                        ➔ {u.newItem[field]}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                          {/* Removed */}
                          {(filterType === "all" || filterType === "removed") &&
                            filteredRemoved.map((item, i) => (
                              <div
                                key={`rem-${i}`}
                                className="p-3 rounded-xl border border-red-300 bg-red-50/70 text-xs"
                              >
                                <span className="font-bold text-red-800 mr-2">- [ลบ]</span>
                                <strong className="text-slate-700 line-through">
                                  {item.title}
                                </strong>
                                <span className="text-slate-500 ml-2">
                                  ({item.license_no} • {item.applicant})
                                </span>
                              </div>
                            ))}

                          {filteredAdded.length === 0 &&
                            filteredUpdated.length === 0 &&
                            filteredRemoved.length === 0 && (
                              <p className="text-xs text-slate-500 text-center py-4">
                                ไม่พบรายการความเปลี่ยนแปลงในเงื่อนไขการค้นหานี้
                              </p>
                            )}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
