// Using standard Response to avoid framework type coupling in lints
import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";
declare const process: any;

interface AlpacaQuote {
  t: string;
  ap: number;
  bp: number;
}

interface AlpacaBar {
  c: number;
  t: string;
}

interface AlpacaBarsResponse {
  bars: {
    [symbol: string]: AlpacaBar[];
  };
}

interface MarketDataResponse {
  symbol: string;
  price: number | null;
  askPrice: number | null;
  bidPrice: number | null;
  previousClose: number | null;
  timestamp: string | null;
  yield: number;
  fallbackUsed: boolean;
  dates: {
    current: string | null;
    previous: string | null;
    quote: string | null;
  };
}

async function fetchMarketDataFromAPI(
  symbol: string,
): Promise<MarketDataResponse> {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
    },
  };

  // Step 1: Get latest quote for fallback price
  const latestUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`;
  console.log("📡 Fetching quote from:", latestUrl);
  const latestRes = await fetchWithTimeout(latestUrl, {
    ...options,
    timeoutMs: 7000,
  });
  const latestData = (await latestRes.json()) as {
    quotes: { [symbol: string]: AlpacaQuote };
  };

  const latestQuote = latestData.quotes?.[symbol];
  const askPrice = latestQuote?.ap ?? null;
  const bidPrice = latestQuote?.bp ?? null;

  // Step 2: Get the most recent 10 bars
  const barsUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1Day&limit=10`;
  console.log("📡 Fetching bars from:", barsUrl);
  const barsRes = await fetchWithTimeout(barsUrl, {
    ...options,
    timeoutMs: 7000,
  });
  const barsData = (await barsRes.json()) as AlpacaBarsResponse;

  const bars = barsData.bars?.[symbol] ?? [];
  const sortedBars = bars
    .filter((b) => typeof b?.c === "number")
    .sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime());

  const currentBar = sortedBars[0] ?? null;
  const previousBar = sortedBars[1] ?? null;

  // Helper to choose first valid positive number
  const firstValid = (...vals: Array<number | null | undefined>) =>
    vals.find((v) => typeof v === "number" && isFinite(v) && v > 0) ?? null;

  // Robust fallbacks
  const resolvedPrice = firstValid(
    currentBar?.c,
    askPrice,
    bidPrice,
    previousBar?.c,
  );
  const resolvedPreviousClose = firstValid(
    previousBar?.c,
    currentBar?.c,
    bidPrice,
    askPrice,
  );

  // Step 3: Get yield data directly
  let actualYield = null;
  try {
    const yieldData = await fetchYieldDataFromAlpaca(symbol, options);
    actualYield = yieldData.yield;
    console.log("📊 Yield data:", actualYield);
  } catch (yieldError) {
    console.log("⚠️ Error fetching yield data:", yieldError);
    actualYield = null;
  }

  return {
    symbol,
    price: resolvedPrice,
    askPrice: askPrice,
    bidPrice: bidPrice,
    previousClose: resolvedPreviousClose,
    timestamp: currentBar?.t ?? latestQuote?.t ?? null,
    yield: actualYield ?? 0,
    fallbackUsed: previousBar == null || !resolvedPrice,
    dates: {
      current: currentBar?.t ?? null,
      previous: previousBar?.t ?? null,
      quote: latestQuote?.t ?? null,
    },
  };
}

async function fetchYieldDataFromAlpaca(symbol: string, options: any) {
  // Get current price for yield calculation
  const priceUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`;
  const priceRes = await fetch(priceUrl, options);
  const priceData = await priceRes.json();
  const currentPrice = priceData.quotes?.[symbol]?.ap || 0;

  // Get dividend data from corporate actions
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const dividendUrl = `https://data.alpaca.markets/v1/corporate-actions?symbols=${symbol}&types=cash_dividend&start=${oneYearAgo.toISOString().split("T")[0]}&end=${today.toISOString().split("T")[0]}`;
  const dividendRes = await fetch(dividendUrl, options);
  const dividendResponseData = await dividendRes.json();

  const dividendData =
    dividendResponseData.corporate_actions?.cash_dividends || [];

  let yieldRate = 0;
  if (Array.isArray(dividendData) && dividendData.length > 0) {
    const sortedDividends = dividendData
      .filter((div: any) => div.symbol === symbol)
      .sort(
        (a: any, b: any) =>
          new Date(b.ex_date).getTime() - new Date(a.ex_date).getTime(),
      );

    if (sortedDividends.length > 0) {
      const uniqueMonths = new Set(
        sortedDividends.map((div) => div.ex_date.substring(0, 7)),
      ).size;

      const totalDividends = sortedDividends
        .slice(0, Math.min(uniqueMonths, 12))
        .reduce((sum, div) => sum + div.rate, 0);

      const averageMonthlyDividend =
        totalDividends / Math.min(uniqueMonths, 12);
      yieldRate =
        currentPrice > 0
          ? ((averageMonthlyDividend * 12) / currentPrice) * 100
          : 0;
    }
  }

  return {
    symbol,
    yield: parseFloat(yieldRate.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

export const dynamic = "force-dynamic"; // server function
export const maxDuration = 10; // seconds safeguard on Vercel

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "LQD";

  console.log("🔍 Requested symbol:", symbol);

  try {
    const marketData = await fetchMarketDataFromAPI(symbol);
    console.log("🎯 Final response:", marketData);
    return new Response(JSON.stringify(marketData), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching market data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch market data" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
