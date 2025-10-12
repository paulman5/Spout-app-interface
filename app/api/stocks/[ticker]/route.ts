import { NextRequest } from "next/server";
import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

// Check for required environment variables
if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
  console.error("Missing required Alpaca API environment variables");
}

const ALPACA_API_KEY = process.env.APCA_API_KEY_ID ?? "";
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY ?? "";
const DATA_URL = "https://data.alpaca.markets";

// Log environment variable status on startup
console.log("API Configuration Status:", {
  hasApiKey: !!ALPACA_API_KEY,
  hasApiSecret: !!ALPACA_API_SECRET,
  dataUrl: DATA_URL,
});

interface AlpacaQuote {
  ap: number; // ask price
  as: number; // ask size
  bp: number; // bid price
  bs: number; // bid size
  t: string; // timestamp
}

interface AlpacaResponse {
  [symbol: string]: AlpacaQuote[];
}

type RangePreset = "7d" | "30d" | "90d";

function computeRangeParams(range: RangePreset) {
  const now = new Date();
  const toIso = (d: Date) => d.toISOString();
  if (range === "7d") {
    const start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    return {
      timeframe: "1Hour",
      start: toIso(start),
      end: toIso(now),
      limit: 1000,
    } as const;
  }
  if (range === "30d") {
    const start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    return {
      timeframe: "1Day",
      start: toIso(start),
      end: toIso(now),
      limit: 60,
    } as const;
  }
  // 90d default
  const start = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  return {
    timeframe: "1Day",
    start: toIso(start),
    end: toIso(now),
    limit: 120,
  } as const;
}

async function fetchHistoricalData(
  ticker: string,
  range: RangePreset,
  retryCount = 0,
): Promise<any[]> {
  // Helper to fetch bars from a given URL (declare outside of blocks for ES5)
  const getBars = async (url: string) => {
    const response = await fetchWithTimeout(url, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
      },
      timeoutMs: 12000,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API request failed ${response.status}: ${body}`);
    }
    const data = await response.json();
    return data?.bars?.[ticker] ?? [];
  };

  try {
    const { timeframe, start, end, limit } = computeRangeParams(range);
    // Try IEX first, then default feed as fallback
    const urlIex = `${DATA_URL}/v2/stocks/bars?symbols=${ticker}&timeframe=${timeframe}&start=${encodeURIComponent(
      start,
    )}&end=${encodeURIComponent(end)}&limit=${limit}&feed=iex`;
    let bars = await getBars(urlIex);
    if (!Array.isArray(bars) || bars.length === 0) {
      const urlDefault = `${DATA_URL}/v2/stocks/bars?symbols=${ticker}&timeframe=${timeframe}&start=${encodeURIComponent(
        start,
      )}&end=${encodeURIComponent(end)}&limit=${limit}`;
      bars = await getBars(urlDefault);
    }
    if (!Array.isArray(bars) || bars.length === 0) {
      // Try latest bar endpoint as a secondary fallback
      const latestUrl = `${DATA_URL}/v2/stocks/bars/latest?symbols=${ticker}&feed=iex`;
      const latestRes = await fetchWithTimeout(latestUrl, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
        timeoutMs: 8000,
      });
      if (latestRes.ok) {
        const lb = await latestRes.json();
        const b = lb?.bars?.[ticker];
        if (b && typeof b.c === "number") {
          const t = b.t || new Date().toISOString();
          return [
            {
              time: t,
              open: b.o ?? b.c,
              high: b.h ?? b.c,
              low: b.l ?? b.c,
              close: b.c,
              volume: b.v ?? 0,
            },
          ];
        }
      }

      // Final fallback: synthesize minimal series from latest quote
      const quoteUrl = `${DATA_URL}/v2/stocks/quotes/latest?symbols=${ticker}`;
      const quoteRes = await fetchWithTimeout(quoteUrl, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
        timeoutMs: 8000,
      });
      if (quoteRes.ok) {
        const q = await quoteRes.json();
        const p = q?.quotes?.[ticker]?.ap || q?.quotes?.[ticker]?.bp;
        if (typeof p === "number" && isFinite(p) && p > 0) {
          const today = new Date().toISOString();
          const yesterday = new Date(
            Date.now() - 24 * 3600 * 1000,
          ).toISOString();
          return [
            { time: yesterday, open: p, high: p, low: p, close: p, volume: 0 },
            { time: today, open: p, high: p, low: p, close: p, volume: 0 },
          ];
        }
      }
      return [];
    }

    // Normalize to chart-compatible structure
    const result = bars
      .map((bar: any) => ({
        time: bar.t,
        open: bar.o ?? bar.c,
        high: bar.h ?? bar.c,
        low: bar.l ?? bar.c,
        close: bar.c,
        volume: bar.v ?? 0,
      }))
      .sort((a: any, b: any) => a.time.localeCompare(b.time));

    return result;
  } catch (error: any) {
    console.error("Error fetching historical data for " + ticker + ":", error);

    if (retryCount < 3) {
      // Short backoff to avoid long serverless durations
      await new Promise((resolve) => setTimeout(resolve, 200));
      return fetchHistoricalData(ticker, range, retryCount + 1);
    }

    throw new Error(`Error fetching historical data: ${error.message}`);
  }
}

interface StockResponse {
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  data: any[];
  dataSource: string;
}

async function fetchStockDataFromAPI(
  ticker: string,
  range: RangePreset,
): Promise<StockResponse> {
  console.log("API Configuration Status:", {
    hasApiKey: !!ALPACA_API_KEY,
    hasApiSecret: !!ALPACA_API_SECRET,
    dataUrl: DATA_URL,
  });

  const historicalData = await fetchHistoricalData(ticker, range);

  if (!historicalData || historicalData.length === 0) {
    // Return sane empty structure instead of 500 to keep UI responsive
    return {
      symbol: ticker,
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      data: [],
      dataSource: "empty",
    } as StockResponse;
  }

  // Get the latest and previous bars from the historical set
  const latestQuote = historicalData[historicalData.length - 1];
  const prevQuote = historicalData[historicalData.length - 2] || latestQuote;

  // Calculate price changes
  let currentPrice = latestQuote.c;
  const priceChange = currentPrice - prevQuote.c;
  const priceChangePercent = (priceChange / prevQuote.c) * 100;

  // Prefer latest bars endpoint for current price; then quote midpoint; then bar close
  try {
    // 1) Latest bar (IEX), then default
    const latestBarIex = `${DATA_URL}/v2/stocks/bars/latest?symbols=${ticker}&feed=iex`;
    let lbRes = await fetchWithTimeout(latestBarIex, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
      },
      timeoutMs: 6000,
    });
    if (!lbRes.ok) {
      const latestBarDefault = `${DATA_URL}/v2/stocks/bars/latest?symbols=${ticker}`;
      lbRes = await fetchWithTimeout(latestBarDefault, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
        timeoutMs: 6000,
      });
    }
    if (lbRes.ok) {
      const lb = await lbRes.json();
      const b = lb?.bars?.[ticker];
      if (b && typeof b.c === "number" && isFinite(b.c)) {
        currentPrice = b.c;
      }
    } else {
      // 2) Fallback to latest quote midpoint
      const latestQuoteUrl = `${DATA_URL}/v2/stocks/quotes/latest?symbols=${ticker}&feed=iex`;
      const lqRes = await fetchWithTimeout(latestQuoteUrl, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
        timeoutMs: 6000,
      });
      if (lqRes.ok) {
        const lq = await lqRes.json();
        const quote = lq?.quotes?.[ticker];
        const ask = typeof quote?.ap === "number" ? quote.ap : undefined;
        const bid = typeof quote?.bp === "number" ? quote.bp : undefined;
        const midpoint =
          typeof ask === "number" &&
          typeof bid === "number" &&
          isFinite(ask) &&
          isFinite(bid)
            ? (ask + bid) / 2
            : undefined;
        if (
          typeof midpoint === "number" &&
          isFinite(midpoint) &&
          midpoint > 0
        ) {
          currentPrice = midpoint;
        }
      }
    }
  } catch (_) {
    // best-effort; keep bar close if quote fails
  }

  return {
    symbol: ticker,
    currentPrice,
    priceChange,
    priceChangePercent,
    data: historicalData,
    dataSource: "real",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    // Get the ticker from the URL params
    const { ticker } = await params;

    // Validate ticker
    if (!ticker || typeof ticker !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid ticker symbol",
        }),
        { status: 400 },
      );
    }

    console.log("🔍 Requested stock data for:", ticker);

    // Validate required env for upstream API
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: missing Alpaca API keys",
        }),
        { status: 500 },
      );
    }

    // Range from query (?range=7d|30d|90d). Default 90d.
    const { searchParams } = new URL(request.url);
    const rq = searchParams.get("range") as RangePreset | null;
    const range: RangePreset =
      rq === "7d" || rq === "30d" || rq === "90d" ? rq : "90d";

    const stockData = await fetchStockDataFromAPI(ticker, range);
    console.log("🎯 Final stock response for", ticker);
    return new Response(JSON.stringify(stockData));
  } catch (error: any) {
    console.error("❌ Error fetching stock data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch stock data",
        details: typeof error?.message === "string" ? error.message : undefined,
      }),
      { status: 500 },
    );
  }
}
