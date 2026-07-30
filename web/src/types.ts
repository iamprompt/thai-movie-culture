export interface MovieItem {
  title: string;
  type: string;
  license_no: string;
  remark: string;
  rating: string;
  approved_date: string;
  applicant: string;
}

export interface GitCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export interface DiffItemUpdated {
  key: string;
  oldItem: MovieItem;
  newItem: MovieItem;
  changedFields: (keyof MovieItem)[];
}

export interface DiffSummary {
  added: MovieItem[];
  updated: DiffItemUpdated[];
  removed: MovieItem[];
  unchangedCount: number;
}
