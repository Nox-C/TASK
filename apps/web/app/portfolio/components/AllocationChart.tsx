// Current content of AllocationChart.tsx
"use client";

import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
];

interface AllocationData {
  [key: string]: string | number | undefined;  // Index signature for compatibility with ChartDataInput
  name: string;
  value: number;
  color?: string;
}

interface AllocationChartProps {
  data: AllocationData[];
  onSegmentClick?: (data: AllocationData) => void;
  showLabels?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export function AllocationChart({
  data,
  onSegmentClick,
  showLabels = true,
  showTooltip = true,
  showLegend = true,
}: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-2">
        <svg
          className="w-12 h-12 text-gray-600"
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
        <p>No allocation data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
            label={
              showLabels
                ? ({ name, percent }) => {
                    return percent > 0.05
                      ? `${name}: ${(percent * 100).toFixed(0)}%`
                      : "";
                  }
                : false
            }
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(data) => onSegmentClick?.(data)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="#1F2937"
                strokeWidth={activeIndex === index ? 2 : 1}
                style={{
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))"
                      : "none",
                  opacity:
                    activeIndex === null || activeIndex === index ? 1 : 0.7,
                  transition: "all 0.2s ease",
                  cursor: onSegmentClick ? "pointer" : "default",
                }}
              />
            ))}
          </Pie>

          {showTooltip && (
            <Tooltip
              formatter={(value: number, name, props) => {
                const percent = (Number(value) / total) * 100;
                return [
                  `${props.payload.name}: ${percent.toFixed(1)}%`,
                  `$${Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                ];
              }}
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
          )}

          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "1rem" }}
              formatter={(value, entry: any, index) => {
                const percent = (entry.payload.value / total) * 100;
                return `${value} (${percent.toFixed(1)}%)`;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AllocationSummary({ data }: { data: AllocationData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No allocation data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      item.color || COLORS[index % COLORS.length],
                  }}
                />
                <span>{item.name}</span>
              </div>
              <span>
                $
                {item.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || COLORS[index % COLORS.length],
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{percentage.toFixed(1)}%</span>
              <span>
                {percentage > 0 && (
                  <span className="text-green-400">
                    +{percentage.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
