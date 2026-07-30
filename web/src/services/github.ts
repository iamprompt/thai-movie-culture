import { MovieItem, GitCommit, DiffSummary, DiffItemUpdated } from "../types";

const REPO_OWNER = "iamprompt";
const REPO_NAME = "thai-movie-culture";
const COMMITS_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=data/movies.json&per_page=30`;
const RAW_BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}`;

export function getMovieKey(item: MovieItem): string {
  return `${item.license_no || "N/A"}:::${item.title}`;
}

export async function fetchCommitList(): Promise<GitCommit[]> {
  try {
    const res = await fetch(COMMITS_URL);
    if (!res.ok) {
      throw new Error(`GitHub API HTTP ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch commit list from GitHub API, creating fallback synthetic commits", err);
  }

  // Fallback if rate limited or unauthenticated API call fails
  return [
    {
      sha: "main",
      commit: {
        message: "Latest dataset (main branch)",
        author: {
          name: "System",
          date: new Date().toISOString(),
        },
      },
    },
  ];
}

export async function fetchMovieDataset(sha: string): Promise<MovieItem[]> {
  // If fetching local / latest file directly or fallback
  let url = `${RAW_BASE_URL}/${sha}/data/movies.json`;
  if (sha === "local" || sha === "current") {
    url = "/data/movies.json";
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Try local fallback path
      const localRes = await fetch("/data/movies.json");
      if (localRes.ok) {
        return await localRes.json();
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch dataset for SHA ${sha}:`, err);
    // Fallback to local import if embedded in dev
    try {
      const localRes = await fetch("/data/movies.json");
      if (localRes.ok) {
        return await localRes.json();
      }
    } catch (_) {}
    return [];
  }
}

export function computeDiff(
  oldList: MovieItem[],
  newList: MovieItem[]
): DiffSummary {
  const oldMap = new Map<string, MovieItem>();
  const newMap = new Map<string, MovieItem>();

  for (const item of oldList) {
    oldMap.set(getMovieKey(item), item);
  }
  for (const item of newList) {
    newMap.set(getMovieKey(item), item);
  }

  const added: MovieItem[] = [];
  const updated: DiffItemUpdated[] = [];
  const removed: MovieItem[] = [];
  let unchangedCount = 0;

  // Check new items against old
  for (const [key, newItem] of newMap.entries()) {
    if (!oldMap.has(key)) {
      added.push(newItem);
    } else {
      const oldItem = oldMap.get(key)!;
      const changedFields: (keyof MovieItem)[] = [];

      (Object.keys(newItem) as (keyof MovieItem)[]).forEach((field) => {
        if (newItem[field] !== oldItem[field]) {
          changedFields.push(field);
        }
      });

      if (changedFields.length > 0) {
        updated.push({
          key,
          oldItem,
          newItem,
          changedFields,
        });
      } else {
        unchangedCount++;
      }
    }
  }

  // Check removed items (in old but not in new)
  for (const [key, oldItem] of oldMap.entries()) {
    if (!newMap.has(key)) {
      removed.push(oldItem);
    }
  }

  return { added, updated, removed, unchangedCount };
}
