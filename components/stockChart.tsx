"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createChart, LineSeries, HistogramSeries } from "lightweight-charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StockData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: StockData[];
  ticker: string;
  height?: number;
}

export default function StockChart({
  data,
  ticker,
  height = 400,
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const priceSeriesRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);

  const [timeRange, setTimeRange] = useState("90d");

  const filteredData = useMemo(() => {
    if (!data || !data.length) return [] as StockData[];
    let days = 90;
    if (timeRange === "30d") days = 30;
    else if (timeRange === "7d") days = 7;
    return data.slice(-days);
  }, [data, timeRange]);

  useEffect(() => {
    if (!chartContainerRef.current || filteredData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: { background: { color: "#ffffff" }, textColor: "#334155" },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#e5e7eb" },
      timeScale: { borderColor: "#e5e7eb", timeVisible: true },
    });
    chartRef.current = chart;

    const priceData = filteredData.map((d) => ({
      time: Math.floor(new Date(d.time).getTime() / 1000) as any,
      value: d.close,
    }));

    const priceSeries = chart.addSeries(LineSeries, {
      color: "#a7c6ed",
      lineWidth: 2,
    });
    priceSeries.setData(priceData);
    priceSeriesRef.current = priceSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#004040",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries
      .priceScale()
      .applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeries.setData(
      filteredData.map((d) => ({
        time: Math.floor(new Date(d.time).getTime() / 1000) as any,
        value: d.volume,
        color: d.close >= d.open ? "#00404033" : "#a7c6ed66",
      })),
    );
    volumeRef.current = volumeSeries;

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [filteredData, height]);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-none"
        style={{ height: `${height}px` }}
      >
        <p className="text-gray-600">Loading {ticker} chart...</p>
      </div>
    );
  }

  return (
    <Card className="w-full border border-[#004040]/15 rounded-none">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-1">
          <div className="mb-1">
            <CardTitle>{ticker} Stock Chart</CardTitle>
            <CardDescription>
              Professional TradingView-style chart
            </CardDescription>
          </div>
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex gap-2">
              <Button
                variant={timeRange === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("7d")}
              >
                7D
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
              >
                30D
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
              >
                90D
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div ref={chartContainerRef} />
      </CardContent>
    </Card>
  );
}
