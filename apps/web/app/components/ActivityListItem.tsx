"use client";

import { StatusPill } from "@task/ui";
import type { ActivityEvent } from "../lib/ws";

interface ActivityListItemProps {
  event: ActivityEvent;
  index: number;
}

export function ActivityListItem({ event, index }: ActivityListItemProps) {
  const getEventColor = (type: string, level: string) => {
    if (level === "error") return "text-walle-orange";
    if (level === "warn") return "text-walle-yellow";
    if (type === "bot") return "text-walle-blue";
    if (type === "market") return "text-walle-green";
    if (type === "system") return "text-walle-blue";
    return "text-gray-300";
  };

  const formatTimestamp = (ts: string | number) => {
    const date = new Date(Number(ts));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusForLevel = (level: string) => {
    switch (level) {
      case "error":
        return "down" as const;
      case "warn":
        return "degraded" as const;
      default:
        return "active" as const;
    }
  };

  return (
    <div
      key={index}
      className="flex items-start justify-between p-3 bg-gray-900/80 rounded-lg border border-gray-700/50 backdrop-blur transition-all hover:bg-gray-900/90"
    >
      <div className="flex items-center gap-3">
        <StatusPill status={getStatusForLevel(event.level)} />
        <div className="flex-1">
          <div className="text-sm">
            <span
              className={`uppercase mr-2 font-medium ${getEventColor(event.type, event.level)}`}
            >
              {event.type}
            </span>
            <span className="text-gray-300">{event.message}</span>
          </div>
          {event.ts && (
            <div className="text-xs text-gray-500 mt-1">
              {formatTimestamp(event.ts)}
            </div>
          )}
        </div>
      </div>
      {event.payload && (
        <span className="text-xs text-gray-500 font-mono">
          {typeof event.payload === "string"
            ? event.payload
            : JSON.stringify(event.payload)}
        </span>
      )}
    </div>
  );
}
