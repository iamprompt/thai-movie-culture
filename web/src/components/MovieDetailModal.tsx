import React from "react";
import { MovieItem } from "../types";
import { X, Film, Award, Calendar, Building, Tag, FileText } from "lucide-react";

interface MovieDetailModalProps {
  movie: MovieItem | null;
  onClose: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
}) => {
  if (!movie) return null;

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
      case "20-":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 p-2 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-start space-x-3 pr-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Film className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {movie.title}
            </h3>
            <span className="inline-block mt-1 text-xs text-slate-400">
              รหัสใบอนุญาต: {movie.license_no || "ไม่ระบุ"}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>เรทติ้ง (Rating)</span>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRatingBadgeColor(
                movie.rating
              )}`}
            >
              {movie.rating || "ไม่ระบุ"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-400">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>ประเภทสื่อ</span>
            </div>
            <span className="font-medium text-slate-200">{movie.type || "ภาพยนตร์"}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-400">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>ช่องทาง / หมายเหตุ</span>
            </div>
            <span className="font-medium text-slate-200">{movie.remark || "-"}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>วันที่ได้รับอนุญาต</span>
            </div>
            <span className="font-medium text-slate-200">
              {movie.approved_date || "-"}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>ผู้ยื่นคำขอ / บริษัท</span>
            </div>
            <span className="font-medium text-slate-100 text-sm leading-relaxed block">
              {movie.applicant || "ไม่ระบุ"}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
