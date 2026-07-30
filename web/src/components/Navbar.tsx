import React from "react";
import { Film, GitCompare, LayoutGrid, BarChart3, ExternalLink, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "diff" | "catalog" | "analytics";
  setActiveTab: (tab: "diff" | "catalog" | "analytics") => void;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#07090e]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-600 p-0.5 shadow-lg shadow-blue-500/10 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Film className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  Thai Movie Culture
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบติดตามและเปรียบเทียบภาพยนตร์/วีดิทัศน์ที่ผ่านการพิจารณา
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("diff")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "diff"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>เปรียบเทียบ (Diff)</span>
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "catalog"
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>ค้นหาภาพยนตร์ ({totalCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "analytics"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>สถิติ (Analytics)</span>
            </button>
          </nav>

          {/* GitHub Repo External Link */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://github.com/iamprompt/thai-movie-culture"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-all"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
