import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 10;
import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";

// Check for required environment variables
if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
  console.error("Missing required Alpaca API environment variables");
}

const ALPACA_API_KEY = process.env.APCA_API_KEY_ID ?? "";
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY ?? "";
const DATA_URL = "https://data.alpaca.markets";

interface StockResponse {
  symbol: string;
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  data: any[];
  dataSource: string;
}

interface BatchResponse {
  [ticker: string]: StockResponse;
}

async function fetchBatchStockData(tickers: string[]): Promise<BatchResponse> {
  const results: BatchResponse = {};

  // Process each ticker directly without caching
  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        try {
          // Simplified data fetching for batch - just get latest quote
          const quoteUrl = `${DATA_URL}/v2/stocks/quotes/latest?symbols=${ticker}`;
          const response = await fetchWithTimeout(quoteUrl, {
            headers: {
              "APCA-API-KEY-ID": ALPACA_API_KEY,
              "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
            },
            timeoutMs: 6000,
          });

          if (!response.ok) {
            throw new Error(`API request failed for ${ticker}`);
          }

          const data = await response.json();
          const quote = data.quotes?.[ticker];

          if (!quote) {
            throw new Error(`No quote data for ${ticker}`);
          }

          const currentPrice = quote.ap || quote.bp;

          if (!currentPrice) {
            throw new Error(`No valid price data for ${ticker}`);
          }

          results[ticker] = {
            symbol: ticker,
            currentPrice,
            priceChange: null, // No historical data for batch API
            priceChangePercent: null, // No historical data for batch API
            data: [], // No historical data for batch API
            dataSource: "real",
          };
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error);

          // Return error entry for this ticker - no mock data in production
          results[ticker] = {
            symbol: ticker,
            currentPrice: null,
            priceChange: null,
            priceChangePercent: null,
            data: [],
            dataSource: "error",
          };
        }
      } catch (error) {
        console.error(`Failed to process ${ticker}:`, error);
        // Add error entry for this ticker
        results[ticker] = {
          symbol: ticker,
          currentPrice: null,
          priceChange: null,
          priceChangePercent: null,
          data: [],
          dataSource: "error",
        };
      }
    }),
  );

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers } = body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: "Invalid tickers array" },
        { status: 400 },
      );
    }

    // Limit batch size to prevent excessive API calls
    if (tickers.length > 20) {
      return NextResponse.json(
        { error: "Too many tickers requested (max 20)" },
        { status: 400 },
      );
    }

    console.log("🔍 Batch stock data request for:", tickers);

    const batchData = await fetchBatchStockData(tickers);

    console.log("🎯 Batch response completed for", tickers.length, "tickers");
    return NextResponse.json(batchData);
  } catch (error) {
    console.error("❌ Error in batch stock fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch stock data" },
      { status: 500 },
    );
  }
}
