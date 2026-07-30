import fs from "node:fs";
import path from "node:path";
import ky from "ky";
import * as cheerio from "cheerio";

export interface MovieItem {
  title: string;
  type: string;
  license_no: string;
  remark: string;
  rating: string;
  approved_date: string;
  applicant: string;
}

const BASE_URL = "https://movie2.culture.go.th/CULTURE_MOVIE61/index.php";
const DATA_FILE_PATH = path.join(process.cwd(), "data", "movies.json");
const DEFAULT_MAX_PAGES = 50;
const CONCURRENCY = 10;

// Configure ky client with retry logic
const http = ky.create({
  timeout: 20000,
  retry: {
    limit: 3,
    methods: ["get"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});

interface ScrapePageResult {
  items: MovieItem[];
  totalPages: number;
  totalItems: number;
}

async function scrapePage(page: number): Promise<ScrapePageResult> {
  const url = `${BASE_URL}?proc=search&page=${page}&keywords=`;
  const html = await http.get(url).text();
  const $ = cheerio.load(html);

  let totalPages = 1;
  let totalItems = 0;

  // Extract total items and total pages from pagination script
  const paginationMatch = html.match(
    /MakePagination\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (paginationMatch) {
    totalItems = parseInt(paginationMatch[1], 10);
    totalPages = parseInt(paginationMatch[3], 10);
  }

  const items: MovieItem[] = [];
  const rows = $("#TB_LICENSE2_LIST tbody tr");

  rows.each((_, el) => {
    const tds = $(el)
      .find("td")
      .map((_, td) => $(td).text().trim())
      .get();

    if (tds.length >= 7) {
      items.push({
        title: tds[0] || "",
        type: tds[1] || "",
        license_no: tds[2] || "",
        remark: tds[3] || "",
        rating: tds[4] || "",
        approved_date: tds[5] || "",
        applicant: tds[6] || "",
      });
    }
  });

  return { items, totalPages, totalItems };
}

function getItemKey(item: MovieItem): string {
  return `${item.license_no}:::${item.title}`;
}

async function main() {
  const args = process.argv.slice(2);
  const isFullRun = args.includes("--full");

  let maxPagesArg = DEFAULT_MAX_PAGES;
  const pagesIndex = args.indexOf("--pages");
  if (pagesIndex !== -1 && args[pagesIndex + 1]) {
    const parsed = parseInt(args[pagesIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxPagesArg = parsed;
    }
  }

  console.log("🎬 Starting Thai Approved Movies & Videos Scraper...");

  // Fetch page 1 first to get total pages count
  console.log("Fetching page 1 to extract total page count...");
  const page1Result = await scrapePage(1);
  const totalPagesInSite = page1Result.totalPages;
  const totalItemsInSite = page1Result.totalItems;

  console.log(
    `Found total ${totalItemsInSite.toLocaleString()} items across ${totalPagesInSite.toLocaleString()} pages on culture.go.th`
  );

  const targetMaxPages = isFullRun
    ? totalPagesInSite
    : Math.min(maxPagesArg, totalPagesInSite);

  console.log(
    `Mode: ${isFullRun ? "FULL SCRAPE" : "INCREMENTAL SCRAPE"} (Fetching pages 1 to ${targetMaxPages})`
  );

  const scrapedItems: MovieItem[] = [...page1Result.items];

  // Fetch remaining pages in concurrent batches
  const pagesToFetch: number[] = [];
  for (let p = 2; p <= targetMaxPages; p++) {
    pagesToFetch.push(p);
  }

  for (let i = 0; i < pagesToFetch.length; i += CONCURRENCY) {
    const chunk = pagesToFetch.slice(i, i + CONCURRENCY);
    console.log(
      `Fetching pages ${chunk[0]} - ${chunk[chunk.length - 1]} of ${targetMaxPages}...`
    );

    const results = await Promise.allSettled(
      chunk.map((p) => scrapePage(p))
    );

    for (let j = 0; j < results.length; j++) {
      const res = results[j];
      const pageNum = chunk[j];
      if (res.status === "fulfilled") {
        scrapedItems.push(...res.value.items);
      } else {
        console.error(`❌ Failed to fetch page ${pageNum}:`, res.reason);
      }
    }
  }

  console.log(`Scraped ${scrapedItems.length} items from site.`);

  // Load existing data if available
  let existingItems: MovieItem[] = [];
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      existingItems = JSON.parse(raw);
      console.log(`Loaded ${existingItems.length} existing items from ${DATA_FILE_PATH}`);
    } catch (e) {
      console.warn(`Could not parse existing ${DATA_FILE_PATH}, starting fresh.`, e);
    }
  }

  // Merge items using Map for deduplication
  const movieMap = new Map<string, MovieItem>();

  // Insert existing items first
  for (const item of existingItems) {
    movieMap.set(getItemKey(item), item);
  }

  let newCount = 0;
  let updatedCount = 0;

  // Insert/update newly scraped items
  for (const item of scrapedItems) {
    const key = getItemKey(item);
    if (!movieMap.has(key)) {
      newCount++;
      movieMap.set(key, item);
    } else {
      const existing = movieMap.get(key)!;
      if (JSON.stringify(existing) !== JSON.stringify(item)) {
        updatedCount++;
        movieMap.set(key, item);
      }
    }
  }

  const mergedItems = Array.from(movieMap.values());

  // Save merged dataset
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(mergedItems, null, 2), "utf-8");

  console.log("\n📊 Summary:");
  console.log(`- Previous dataset size: ${existingItems.length}`);
  console.log(`- Scraped items this run: ${scrapedItems.length}`);
  console.log(`- New items added: ${newCount}`);
  console.log(`- Items updated: ${updatedCount}`);
  console.log(`- Total dataset size: ${mergedItems.length}`);
  console.log(`💾 Saved to ${DATA_FILE_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
