import React, { useState, useMemo } from "react";
import { MovieItem } from "../types";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Film,
} from "lucide-react";

interface CatalogExplorerProps {
  movies: MovieItem[];
  onViewDetail: (movie: MovieItem) => void;
}

const ITEMS_PER_PAGE = 15;

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  movies,
  onViewDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("ALL");
  const [selectedRemark, setSelectedRemark] = useState<string>("ALL");
  const [selectedApplicant, setSelectedApplicant] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique applicants & ratings
  const ratings = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.rating && set.add(m.rating));
    return Array.from(set).sort();
  }, [movies]);

  const remarks = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.remark && set.add(m.remark));
    return Array.from(set).sort();
  }, [movies]);

  const applicants = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.applicant && set.add(m.applicant));
    return Array.from(set).sort();
  }, [movies]);

  // Filtered dataset
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchSearch =
        searchQuery === "" ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.license_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applicant.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRating =
        selectedRating === "ALL" || m.rating === selectedRating;
      const matchRemark =
        selectedRemark === "ALL" || m.remark === selectedRemark;
      const matchApplicant =
        selectedApplicant === "ALL" || m.applicant === selectedApplicant;

      return matchSearch && matchRating && matchRemark && matchApplicant;
    });
  }, [movies, searchQuery, selectedRating, selectedRemark, selectedApplicant]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating, selectedRemark, selectedApplicant]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredMovies, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thai_approved_movies_export.json`;
    a.click();
  };

  const exportCSV = () => {
    const headers = [
      "title",
      "type",
      "license_no",
      "remark",
      "rating",
      "approved_date",
      "applicant",
    ];
    const rows = filteredMovies.map((m) =>
      headers
        .map((h) => `"${(m[h as keyof MovieItem] || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thai_approved_movies_export.csv`;
    a.click();
  };

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case "ทั่วไป":
      case "G":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "13+":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "15+":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "18+":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเรื่อง, เลขที่ใบอนุญาต, หรือชื่อผู้ยื่นคำขอ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportJSON}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Rating Filter */}
          <div>
            <label className="block font-medium text-slate-400 mb-1">
              เรทติ้ง (Rating):
            </label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none"
            >
              <option value="ALL">ทั้งหมด (All Ratings)</option>
              {ratings.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Medium Filter */}
          <div>
            <label className="block font-medium text-slate-400 mb-1">
              ช่องทางเผยแพร่ (Medium):
            </label>
            <select
              value={selectedRemark}
              onChange={(e) => setSelectedRemark(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none"
            >
              <option value="ALL">ทั้งหมด (All Mediums)</option>
              {remarks.map((rm) => (
                <option key={rm} value={rm}>
                  {rm}
                </option>
              ))}
            </select>
          </div>

          {/* Applicant Filter */}
          <div>
            <label className="block font-medium text-slate-400 mb-1">
              ผู้ยื่นคำขอ (Applicant):
            </label>
            <select
              value={selectedApplicant}
              onChange={(e) => setSelectedApplicant(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none truncate"
            >
              <option value="ALL">ทั้งหมด (All Applicants)</option>
              {applicants.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          แสดง {paginatedMovies.length} จากทั้งหมด{" "}
          <strong className="text-amber-400 font-bold">
            {filteredMovies.length}
          </strong>{" "}
          รายการที่ตรงตามเงื่อนไข
        </span>
        <span>
          หน้า {currentPage} / {totalPages}
        </span>
      </div>

      {/* Catalog Table Grid */}
      {paginatedMovies.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          <Film className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-300">
            ไม่พบภาพยนตร์ตามเงื่อนไขการค้นหา
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ชื่อเรื่อง (Title)</th>
                  <th className="py-3.5 px-4">รหัสใบอนุญาต</th>
                  <th className="py-3.5 px-4">เรทติ้ง</th>
                  <th className="py-3.5 px-4">ช่องทาง</th>
                  <th className="py-3.5 px-4">วันที่อนุมัติ</th>
                  <th className="py-3.5 px-4">ผู้ยื่นคำขอ</th>
                  <th className="py-3.5 px-4 text-right">แอ็กชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedMovies.map((movie, idx) => (
                  <tr
                    key={`movie-${idx}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-100 max-w-xs">
                      {movie.title}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">
                      {movie.license_no || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRatingBadgeColor(
                          movie.rating
                        )}`}
                      >
                        {movie.rating || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {movie.remark || movie.type || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {movie.approved_date || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate">
                      {movie.applicant || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewDetail(movie)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-all"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-t border-slate-800">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg flex items-center space-x-1 border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              หน้า {currentPage} จาก {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg flex items-center space-x-1 border border-slate-700"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
