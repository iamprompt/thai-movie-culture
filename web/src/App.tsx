import React, { useState, useEffect } from "react";
import { MovieItem, GitCommit, DiffSummary } from "./types";
import { fetchCommitList, fetchMovieDataset, computeDiff } from "./services/github";
import { Navbar } from "./components/Navbar";
import { DiffViewer } from "./components/DiffViewer";
import { CatalogExplorer } from "./components/CatalogExplorer";
import { AnalyticsView } from "./components/AnalyticsView";
import { MovieDetailModal } from "./components/MovieDetailModal";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"diff" | "catalog" | "analytics">("diff");
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [selectedOldSha, setSelectedOldSha] = useState<string>("");
  const [selectedNewSha, setSelectedNewSha] = useState<string>("");

  const [currentDataset, setCurrentDataset] = useState<MovieItem[]>([]);
  const [oldDataset, setOldDataset] = useState<MovieItem[]>([]);

  const [diffSummary, setDiffSummary] = useState<DiffSummary | null>(null);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(true);
  const [isLoadingDiff, setIsLoadingDiff] = useState<boolean>(false);

  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);

  // Initial load of commits & latest dataset
  useEffect(() => {
    async function init() {
      setIsLoadingCommits(true);
      const commitList = await fetchCommitList();
      setCommits(commitList);

      if (commitList.length >= 2) {
        setSelectedOldSha(commitList[commitList.length - 1].sha);
        setSelectedNewSha(commitList[0].sha);
      } else if (commitList.length === 1) {
        setSelectedOldSha(commitList[0].sha);
        setSelectedNewSha(commitList[0].sha);
      } else {
        setSelectedOldSha("local");
        setSelectedNewSha("local");
      }

      const latestData = await fetchMovieDataset("current");
      setCurrentDataset(latestData);
      setIsLoadingCommits(false);
    }

    init();
  }, []);

  // Compute diff when selected SHAs change
  useEffect(() => {
    if (!selectedOldSha || !selectedNewSha) return;

    async function loadDiff() {
      setIsLoadingDiff(true);
      const [oldData, newData] = await Promise.all([
        fetchMovieDataset(selectedOldSha),
        fetchMovieDataset(selectedNewSha),
      ]);

      setOldDataset(oldData);
      if (selectedNewSha === commits[0]?.sha || selectedNewSha === "current") {
        setCurrentDataset(newData);
      }

      const diff = computeDiff(oldData, newData);
      setDiffSummary(diff);
      setIsLoadingDiff(false);
    }

    loadDiff();
  }, [selectedOldSha, selectedNewSha, commits]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={currentDataset.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "diff" && (
          <DiffViewer
            commits={commits}
            selectedOldSha={selectedOldSha}
            selectedNewSha={selectedNewSha}
            onSelectOldSha={setSelectedOldSha}
            onSelectNewSha={setSelectedNewSha}
            diffSummary={diffSummary}
            isLoading={isLoadingDiff || isLoadingCommits}
            onViewDetail={(m) => setSelectedMovie(m)}
          />
        )}

        {activeTab === "catalog" && (
          <CatalogExplorer
            movies={currentDataset}
            onViewDetail={(m) => setSelectedMovie(m)}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView movies={currentDataset} />
        )}
      </main>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05070a] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            © {new Date().getFullYear()} Thai Approved Movie & Video Catalog Scraper • Data automatically synced from culture.go.th
          </p>
        </div>
      </footer>
    </div>
  );
};
export default App;
