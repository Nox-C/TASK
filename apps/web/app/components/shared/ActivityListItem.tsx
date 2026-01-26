"use client";
import { StatusPill } from "@task/ui";
import type { ActivityEvent } from "../../lib/ws";

interface ActivityListItemProps {
  evt: ActivityEvent;
}

const getActivityColor = (type: string, level: string) => {
  if (level === "error") return "bg-red-900/40 border-red-700/50";
  if (level === "warn") return "bg-yellow-900/40 border-yellow-700/50";
  if (type === "system") return "bg-blue-900/40 border-blue-700/50";
  if (type === "bot") return "bg-green-900/40 border-green-700/50";
  return "bg-gray-900/40 border-gray-700/50";
};

const getTextColor = (level: string) => {
  if (level === "error") return "text-red-400";
  if (level === "warn") return "text-yellow-400";
  return "text-white";
};

export const ActivityListItem = ({ evt }: ActivityListItemProps) => {
  const status = (
    evt.level === "error"
      ? "down"
      : evt.level === "warn"
        ? "degraded"
        : "active"
  ) as any;
  const colorClass = getActivityColor(evt.type, evt.level || "info");

  return (
    <div
      className={`flex items-start justify-between p-3 rounded-lg border transition-all ${colorClass}`}
    >
      <div className="flex items-center gap-3">
        <StatusPill status={status} />
        <div>
          <div className="text-sm">
            <span
              className={`uppercase text-xs font-semibold mr-2 ${getTextColor(evt.level || "info")}`}
            >
              {evt.type}
            </span>
            <span className={getTextColor(evt.level || "info")}>
              {evt.message}
            </span>
          </div>
          {evt.ts && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(Number(evt.ts)).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      {evt.payload && (
        <span className="text-xs text-blue-400/80 font-mono self-start mt-1">
          {typeof evt.payload === "string" ? evt.payload : ""}
        </span>
      )}
    </div>
  );
};
