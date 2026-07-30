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
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "13+":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "15+":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "18+":
        return "bg-red-50 text-red-700 border-red-300";
      case "20-":
        return "bg-purple-50 text-purple-700 border-purple-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-start space-x-3 pr-8">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Film className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {movie.title}
            </h3>
            <span className="inline-block mt-1 text-xs font-mono text-slate-500">
              รหัสใบอนุญาต: {movie.license_no || "ไม่ระบุ"}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <Award className="w-4 h-4 text-amber-600" />
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

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>ประเภทสื่อ</span>
            </div>
            <span className="font-medium text-slate-800">{movie.type || "ภาพยนตร์"}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>ช่องทาง / หมายเหตุ</span>
            </div>
            <span className="font-medium text-slate-800">{movie.remark || "-"}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>วันที่ได้รับอนุญาต</span>
            </div>
            <span className="font-medium text-slate-800">
              {movie.approved_date || "-"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600 mb-1">
              <Building className="w-4 h-4 text-cyan-600" />
              <span>ผู้ยื่นคำขอ / บริษัท</span>
            </div>
            <span className="font-medium text-slate-900 text-sm leading-relaxed block">
              {movie.applicant || "ไม่ระบุ"}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
