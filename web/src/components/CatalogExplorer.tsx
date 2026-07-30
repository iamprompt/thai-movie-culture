import React, { useState, useMemo } from "react";
import { MovieItem } from "../types";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Film,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CatalogExplorerProps {
  movies: MovieItem[];
  onViewDetail: (movie: MovieItem) => void;
}

type SortColumn =
  | "title"
  | "license_no"
  | "rating"
  | "remark"
  | "approved_date"
  | "applicant";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 15;

// Thai month dictionary for date parsing
const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 0,
  "ก.พ.": 1,
  "มี.ค.": 2,
  "เม.ย.": 3,
  "พ.ค.": 4,
  "มิ.ย.": 5,
  "ก.ค.": 6,
  "ส.ค.": 7,
  "ก.ย.": 8,
  "ต.ค.": 9,
  "พ.ย.": 10,
  "ธ.ค.": 11,
};

function parseThaiDate(dateStr: string): number {
  if (!dateStr) return 0;
  // Format example: "24 ก.ค. 2569"
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const month = THAI_MONTHS[parts[1]] ?? 0;
    const yearBE = parseInt(parts[2], 10) || 2500;
    const yearAD = yearBE - 543;
    return new Date(Date.UTC(yearAD, month, day)).getTime();
  }
  return 0;
}

const RATING_RANKS: Record<string, number> = {
  "ทั่วไป": 1,
  G: 1,
  "13+": 2,
  "15+": 3,
  "18+": 4,
  "20-": 5,
  "20+": 5,
};

function getRatingRank(rating: string): number {
  return RATING_RANKS[rating.trim()] ?? 99;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  movies,
  onViewDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("ALL");
  const [selectedRemark, setSelectedRemark] = useState<string>("ALL");
  const [selectedApplicant, setSelectedApplicant] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting State - default by approved_date descending
  const [sortColumn, setSortColumn] = useState<SortColumn>("approved_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Extract unique filter options
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

  // Handle column header click for sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if already sorting by this column
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted dataset
  const filteredAndSortedMovies = useMemo(() => {
    // 1. Filter
    const filtered = movies.filter((m) => {
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

    // 2. Sort
    return filtered.sort((a, b) => {
      let result = 0;

      switch (sortColumn) {
        case "approved_date": {
          const timeA = parseThaiDate(a.approved_date);
          const timeB = parseThaiDate(b.approved_date);
          result = timeA - timeB;
          break;
        }
        case "rating": {
          const rankA = getRatingRank(a.rating);
          const rankB = getRatingRank(b.rating);
          result = rankA - rankB;
          break;
        }
        case "title": {
          result = a.title.localeCompare(b.title, "th");
          break;
        }
        case "license_no": {
          result = a.license_no.localeCompare(b.license_no, "th", {
            numeric: true,
          });
          break;
        }
        case "remark": {
          const valA = a.remark || a.type || "";
          const valB = b.remark || b.type || "";
          result = valA.localeCompare(valB, "th");
          break;
        }
        case "applicant": {
          result = a.applicant.localeCompare(b.applicant, "th");
          break;
        }
        default:
          result = 0;
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [
    movies,
    searchQuery,
    selectedRating,
    selectedRemark,
    selectedApplicant,
    sortColumn,
    sortDirection,
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating, selectedRemark, selectedApplicant, sortColumn, sortDirection]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredAndSortedMovies.length / ITEMS_PER_PAGE) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedMovies, currentPage]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredAndSortedMovies, null, 2)], {
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
    const rows = filteredAndSortedMovies.map((m) =>
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
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "13+":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "15+":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "18+":
        return "bg-red-50 text-red-700 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเรื่อง, เลขที่ใบอนุญาต, หรือชื่อผู้ยื่นคำขอ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportJSON}
              className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-300 flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-300 flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
          {/* Rating Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">
              เรทติ้ง (Rating):
            </label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:outline-none cursor-pointer"
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
            <label className="block font-medium text-slate-600 mb-1">
              ช่องทางเผยแพร่ (Medium):
            </label>
            <select
              value={selectedRemark}
              onChange={(e) => setSelectedRemark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:outline-none cursor-pointer"
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
            <label className="block font-medium text-slate-600 mb-1">
              ผู้ยื่นคำขอ (Applicant):
            </label>
            <select
              value={selectedApplicant}
              onChange={(e) => setSelectedApplicant(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:outline-none truncate cursor-pointer"
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

      {/* Stats Counter & Active Sort Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 px-1 gap-2">
        <span>
          แสดง {paginatedMovies.length} จากทั้งหมด{" "}
          <strong className="text-amber-700 font-bold">
            {filteredAndSortedMovies.length}
          </strong>{" "}
          รายการที่ตรงตามเงื่อนไข
        </span>
        <span className="flex items-center space-x-1 font-medium text-slate-500">
          <span>เรียงตาม:</span>
          <strong className="text-slate-800 uppercase font-bold">
            {sortColumn} ({sortDirection === "asc" ? "น้อยไปมาก ↑" : "มากไปน้อย ↓"})
          </strong>
        </span>
      </div>

      {/* Catalog Table Grid */}
      {paginatedMovies.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 bg-white">
          <Film className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-800">
            ไม่พบภาพยนตร์ตามเงื่อนไขการค้นหา
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200 select-none">
                <tr>
                  {/* Title Header */}
                  <th
                    onClick={() => handleSort("title")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>ชื่อเรื่อง (Title)</span>
                      {renderSortIcon("title")}
                    </div>
                  </th>

                  {/* License No Header */}
                  <th
                    onClick={() => handleSort("license_no")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>รหัสใบอนุญาต</span>
                      {renderSortIcon("license_no")}
                    </div>
                  </th>

                  {/* Rating Header */}
                  <th
                    onClick={() => handleSort("rating")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>เรทติ้ง</span>
                      {renderSortIcon("rating")}
                    </div>
                  </th>

                  {/* Medium Header */}
                  <th
                    onClick={() => handleSort("remark")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>ช่องทาง</span>
                      {renderSortIcon("remark")}
                    </div>
                  </th>

                  {/* Approved Date Header */}
                  <th
                    onClick={() => handleSort("approved_date")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>วันที่อนุมัติ</span>
                      {renderSortIcon("approved_date")}
                    </div>
                  </th>

                  {/* Applicant Header */}
                  <th
                    onClick={() => handleSort("applicant")}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>ผู้ยื่นคำขอ</span>
                      {renderSortIcon("applicant")}
                    </div>
                  </th>

                  <th className="py-3.5 px-4 text-right">แอ็กชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedMovies.map((movie, idx) => (
                  <tr
                    key={`movie-${idx}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">
                      {movie.title}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
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
                    <td className="py-3 px-4 text-xs text-slate-700">
                      {movie.remark || movie.type || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {movie.approved_date || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 max-w-xs truncate">
                      {movie.applicant || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewDetail(movie)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
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
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium bg-white disabled:opacity-40 text-slate-700 rounded-lg flex items-center space-x-1 border border-slate-300 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>ย้อนกลับ</span>
            </button>

            <span className="text-xs text-slate-600 font-medium">
              หน้า {currentPage} จาก {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium bg-white disabled:opacity-40 text-slate-700 rounded-lg flex items-center space-x-1 border border-slate-300 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
