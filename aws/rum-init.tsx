"use client";

import { useEffect } from "react";
import { AwsRum, AwsRumConfig } from "aws-rum-web";

export function RumInit() {
  useEffect(() => {
    try {
      const APPLICATION_ID = process.env.NEXT_PUBLIC_AWS_RUM_APP_ID || "";
      const APPLICATION_VERSION =
        process.env.NEXT_PUBLIC_AWS_RUM_APP_VERSION || "1.0.0";
      const APPLICATION_REGION =
        process.env.NEXT_PUBLIC_AWS_RUM_REGION || "us-east-1";

      if (!APPLICATION_ID) return; // disabled if not configured

      const config: AwsRumConfig = {
        sessionSampleRate: Number(
          process.env.NEXT_PUBLIC_AWS_RUM_SAMPLE_RATE || 0.1,
        ),
        identityPoolId: process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID || "",
        endpoint:
          process.env.NEXT_PUBLIC_AWS_RUM_ENDPOINT ||
          "https://dataplane.rum.us-east-1.amazonaws.com",
        telemetries: ["performance", "errors", "http"],
        allowCookies: true,
        enableXRay: false,
      };

      new AwsRum(
        APPLICATION_ID,
        APPLICATION_VERSION,
        APPLICATION_REGION,
        config,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("RUM initialization failed:", error);
    }
  }, []);

  return null;
}
