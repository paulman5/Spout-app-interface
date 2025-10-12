import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";
declare const process: any;

interface YieldData {
  symbol: string;
  yield: number;
  timestamp: string;
  note?: string;
}

interface AlpacaDividend {
  cusip: string;
  ex_date: string;
  payable_date: string;
  rate: number;
  symbol: string;
  foreign: boolean;
}

async function fetchYieldDataFromAPI(symbol: string): Promise<YieldData> {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
    },
  };

  // Get current price for yield calculation
  const priceUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`;
  const priceRes = await fetchWithTimeout(priceUrl, {
    ...options,
    timeoutMs: 7000,
  });
  const priceData = await priceRes.json();
  console.log("Price data:", priceData);
  const currentPrice = priceData.quotes?.[symbol]?.ap || 0; // Using ask price
  console.log("Current price:", currentPrice);

  // Get dividend data from corporate actions
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const dividendUrl = `https://data.alpaca.markets/v1/corporate-actions?symbols=${symbol}&types=cash_dividend&start=${oneYearAgo.toISOString().split("T")[0]}&end=${today.toISOString().split("T")[0]}`;
  console.log("Dividend URL:", dividendUrl);
  const dividendRes = await fetchWithTimeout(dividendUrl, {
    ...options,
    timeoutMs: 7000,
  });
  const dividendResponseData = await dividendRes.json();

  // Fix how we access the corporate_actions data
  const dividendData =
    dividendResponseData.corporate_actions?.cash_dividends || [];

  // Get the most recent dividend payment
  let yieldRate = 0;
  if (Array.isArray(dividendData) && dividendData.length > 0) {
    // Get the most recent dividend payment
    const sortedDividends = dividendData
      .filter((div: AlpacaDividend) => div.symbol === symbol)
      .sort(
        (a: AlpacaDividend, b: AlpacaDividend) =>
          new Date(b.ex_date).getTime() - new Date(a.ex_date).getTime(),
      );

    if (sortedDividends.length > 0) {
      // Count how many unique months we have dividends for
      const uniqueMonths = new Set(
        sortedDividends.map((div) => div.ex_date.substring(0, 7)), // Get YYYY-MM
      ).size;

      // Calculate average monthly dividend amount
      const totalDividends = sortedDividends
        .slice(0, Math.min(uniqueMonths, 12)) // Use at most 12 months of data
        .reduce((sum, div) => sum + div.rate, 0);

      const averageMonthlyDividend =
        totalDividends / Math.min(uniqueMonths, 12);

      // Calculate annual yield:
      yieldRate =
        currentPrice > 0
          ? ((averageMonthlyDividend * 12) / currentPrice) * 100
          : 0;
    }
  }

  console.log("Current price:", currentPrice);
  console.log("Most recent monthly dividend:", dividendData[0]?.rate);
  console.log("Calculated annual yield rate:", yieldRate);

  return {
    symbol,
    yield: parseFloat(yieldRate.toFixed(2)),
    timestamp: new Date().toISOString(),
    note: "Using cached Alpaca data",
  };
}

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "LQD";

  console.log("🔍 Requested yield for symbol:", symbol);

  try {
    const yieldData = await fetchYieldDataFromAPI(symbol);
    console.log("🎯 Final yield response:", yieldData);
    return new Response(JSON.stringify(yieldData), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching yield data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch yield data" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
