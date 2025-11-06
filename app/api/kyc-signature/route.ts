import { NextRequest, NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, onchainIDAddress, claimData, topic, countryCode } =
      body;

    // Validate required fields
    if (
      !userAddress ||
      !onchainIDAddress ||
      !claimData ||
      !topic ||
      !countryCode
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call the external API
    const response = await fetchWithTimeout(
      "https://rwa-deploy-backend-w6i2.onrender.com/user/kyc-signature",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BACKEND_API_KEY ?? "",
        },
        body: JSON.stringify({
          userAddress,
          onchainIDAddress,
          claimData,
          topic,
          countryCode,
        }),
        timeoutMs: 8000,
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get KYC signature from external API" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Debug: Check if the problematic address is being returned
    ("🔍 KYC Signature API Debug:");
    console.log("External API response:", data);
    console.log("Issuer address from API:", data.issuerAddress);
    console.log("Expected issuer addresses:");
    console.log(
      "  - Base Sepconsole.logolia: 0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F",
    );
    console.log(
      "  - Pharos Testnet: 0xA5C77b623BEB3bC0071fA568de99e15Ccc06C7cb",
    );
    console.log(
      "  - Problematic address: 0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717",
    );

    if (data.issuerAddress === "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717") {
      console.warn(
        "⚠️ WARNING: External API returned the problematic address!",
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("KYC signature API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
