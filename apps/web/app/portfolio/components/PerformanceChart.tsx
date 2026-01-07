"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface PerformanceData {
  date: string;
  value: number;
  pnl: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  height?: number;
  showPnlLine?: boolean;
  showReferenceLine?: boolean;
}

export function PerformanceChart({
  data,
  height = 300,
  showPnlLine = true,
  showReferenceLine = true,
}: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-2">
        <svg
          className="w-12 h-12 text-gray-600 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p>No performance data available</p>
        <p className="text-sm text-gray-600">
          Start trading to see your performance metrics
        </p>
      </div>
    );
  }

  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const referenceValue = data[0]?.value || 0;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickLine={{ stroke: "#4B5563" }}
            axisLine={{ stroke: "#4B5563" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
            tickMargin={10}
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickLine={{ stroke: "#4B5563" }}
            axisLine={{ stroke: "#4B5563" }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            width={90}
            domain={[minValue * 0.99, maxValue * 1.01]}
          />

          {showPnlLine && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickLine={{ stroke: "#4B5563" }}
              axisLine={{ stroke: "#4B5563" }}
              tickFormatter={(value) => `${value}%`}
              width={60}
            />
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
              borderRadius: "0.5rem",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
            formatter={(value: number, name: string) => {
              if (name === "value") {
                return [
                  `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  "Portfolio Value",
                ];
              }
              return [
                `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`,
                "24h Change",
              ];
            }}
          />

          {showReferenceLine && (
            <ReferenceLine
              y={referenceValue}
              yAxisId="left"
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
              label={{
                value: "Start",
                fill: "#9CA3AF",
                fontSize: 12,
                position: "right",
                offset: 5,
              }}
            />
          )}

          <Legend
            wrapperStyle={{
              paddingTop: "1rem",
              fontSize: "0.875rem",
            }}
            formatter={(value) => {
              if (value === "value") return "Portfolio Value";
              if (value === "pnl") return "24h Change";
              return value;
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#1D4ED8",
              strokeWidth: 2,
              fill: "#3B82F6",
            }}
            name="Portfolio Value"
          />

          {showPnlLine && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pnl"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 3"
              name="24h Change"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
