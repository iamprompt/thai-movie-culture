# 🎬 Thai Approved Movie & Video Catalog Scraper

Automated scraper and GitHub Actions workflow for fetching and maintaining the official catalog of approved movies and video content from the Ministry of Culture, Thailand ([movie2.culture.go.th](https://movie2.culture.go.th/CULTURE_MOVIE61/index.php?proc=search&page=1&keywords=)).

## 📦 Dataset

The output dataset is stored in JSON format at:
- [`data/movies.json`](data/movies.json)

### Schema

```json
[
  {
    "title": "ซีรีส์ที่สามของเธอ ตอนที่ 1 / Your Third Series EP.1",
    "type": "ภาพยนตร์",
    "license_no": "ภย. 292/69",
    "remark": "หนังแผ่น",
    "rating": "13+",
    "approved_date": "24 ก.ค. 2569",
    "applicant": "บริษัท มันดีเวิร์ค จำกัด"
  }
]
```

---

## 🚀 Local Usage

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Commands

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Incremental Scrape** (default: latest 50 pages / 500 items):
   ```bash
   pnpm run scrape
   ```

3. **Run Incremental Scrape with custom page count**:
   ```bash
   pnpm run scrape -- --pages 10
   ```

4. **Run Full Scrape** (fetches all ~14,700+ pages):
   ```bash
   pnpm run scrape:full
   ```

---

## 🤖 GitHub Actions Workflow

The workflow `.github/workflows/fetch-movies.yml` automatically handles scraping, checking for diffs, and committing any changes to `data/movies.json`.

### Triggers

1. **External Event Trigger (`repository_dispatch`)**:
   Trigger externally via GitHub REST API:
   ```bash
   curl -X POST \
     -H "Accept: application/vnd.github+json" \
     -H "Authorization: Bearer <YOUR_GITHUB_TOKEN>" \
     https://api.github.com/repos/<OWNER>/<REPO>/dispatches \
     -d '{"event_type": "fetch-movies", "client_payload": {"max_pages": 50}}'
   ```

2. **Manual UI Trigger (`workflow_dispatch`)**:
   - Go to Actions tab in GitHub repository.
   - Select **Fetch Approved Thai Movies & Videos Data**.
   - Choose options (Full scrape vs Incremental max pages) and click **Run workflow**.

3. **Scheduled Cron**:
   - Runs daily at `00:00 UTC`.
