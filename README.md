# 🎬 Thai Approved Movie & Video Catalog Scraper & Comparison Site

Automated scraper and dynamic web application for fetching, tracking, and comparing the official catalog of approved movies and video content from the Ministry of Culture, Thailand ([movie2.culture.go.th](https://movie2.culture.go.th/CULTURE_MOVIE61/index.php?proc=search&page=1&keywords=)).

---

## 🌐 Web Comparison Site Features

The web app ([`web/`](web/)) provides an interactive UI to inspect and compare catalog changes across versions:

1. **Commit Diff Comparison (เปรียบเทียบ)**: Select any two GitHub commits to view Added (`+`), Modified (`✎`), and Removed (`-`) movie entries with visual diffs.
2. **Catalog Explorer (ค้นหาภาพยนตร์)**: Fast, interactive search with instant filters for Rating (13+, 15+, 18+, ทั่วไป), Medium (หนังโรง, หนังแผ่น), and Applicant company names. Includes JSON and CSV export.
3. **Analytics (สถิติ)**: Rating distribution bars, medium breakdowns, and top applicant company rankings.

---

## ⚡ Cloudflare Pages Manual Deployment

To host the web app on **Cloudflare Pages**:

1. Connect your repository (`iamprompt/thai-movie-culture`) in the Cloudflare Dashboard (**Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**).
2. Set the build settings:
   - **Framework preset**: `Vite` / `None`
   - **Build command**: `pnpm build` (or `pnpm --filter web build`)
   - **Build output directory**: `web/dist`
   - **Root directory**: `/` (or `web`)

---

## 📦 Local Usage

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Commands

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Scraper (Default: 50 pages / 500 items)**:
   ```bash
   pnpm run scrape
   ```

3. **Run Scraper for specific page depth**:
   ```bash
   pnpm run scrape -- --pages 10
   ```

4. **Run Full Scrape (~14,700 pages)**:
   ```bash
   pnpm run scrape:full
   ```

5. **Start Web Comparison App locally**:
   ```bash
   pnpm dev:web
   ```

6. **Build Web Comparison App for production**:
   ```bash
   pnpm build
   ```

---

## 🤖 GitHub Actions & REST API Trigger

The workflow `.github/workflows/fetch-movies.yml` scrapes and commits updates to `data/movies.json`.

### Triggering via REST API

**Repository Dispatch**:
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/iamprompt/thai-movie-culture/dispatches \
  -d '{
    "event_type": "fetch-movies",
    "client_payload": {
      "max_pages": 50,
      "full_scrape": false
    }
  }'
```
