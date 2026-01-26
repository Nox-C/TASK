"use client";

import { Button, Card, KpiCard, Skeleton, StatusPill } from "@task/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Api } from "../lib/api";

interface Task {
  id: string;
  name: string;
  triggers: TaskTrigger[];
  actions: TaskAction[];
  createdAt: string;
  status?: "active" | "inactive" | "running";
  lastRun?: string;
  nextRun?: string;
  runCount?: number;
}

interface TaskTrigger {
  id?: string;
  type: "cron" | "webhook";
  config: any;
}

interface TaskAction {
  id?: string;
  type: "bot.start" | "bot.stop" | "notify";
  config: any;
}

interface TaskRun {
  id: string;
  taskId: string;
  status: "enqueued" | "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  task?: {
    id: string;
    name: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentRuns, setRecentRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, runsData] = await Promise.all([
          Api.tasks.list(),
          Api.tasks.recentRuns(20),
        ]);

        // Enhance tasks with mock status and run data
        const enhancedTasks = tasksData.map((task, index) => ({
          ...task,
          status: (Math.random() > 0.3 ? "active" : "inactive") as
            | "active"
            | "inactive"
            | "running",
          lastRun: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
          nextRun: new Date(Date.now() + Math.random() * 3600000).toISOString(),
          runCount: Math.floor(Math.random() * 100),
        }));

        setTasks(enhancedTasks);
        setRecentRuns(runsData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunTask = async (taskId: string) => {
    try {
      await Api.tasks.run(taskId);
      // Refresh recent runs
      const runsData = await Api.tasks.recentRuns(20);
      setRecentRuns(runsData);
    } catch (error) {
      console.error("Failed to run task:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "text-walle-green";
      case "running":
        return "text-walle-blue";
      case "failed":
        return "text-walle-orange";
      case "inactive":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusPill = (status?: string) => {
    switch (status) {
      case "active":
        return "connected" as const;
      case "running":
        return "active" as const;
      case "failed":
        return "down" as const;
      case "inactive":
        return "disconnected" as const;
      default:
        return "disconnected" as const;
    }
  };

  const formatTriggerDescription = (trigger: TaskTrigger) => {
    if (trigger.type === "cron") {
      return `Cron: ${trigger.config.schedule || "Daily"}`;
    }
    return `Webhook: ${trigger.config.url || "API Endpoint"}`;
  };

  const formatActionDescription = (action: TaskAction) => {
    switch (action.type) {
      case "bot.start":
        return `Start bot: ${action.config.botId || "Bot ID"}`;
      case "bot.stop":
        return `Stop bot: ${action.config.botId || "Bot ID"}`;
      case "notify":
        return `Send notification: ${action.config.message || "Alert"}`;
      default:
        return `Action: ${action.type}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walle-darkblue-base text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
            <Skeleton className="h-28" rounded="xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" rounded="xl" />
            <Skeleton className="h-64" rounded="xl" />
          </div>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter((task) => task.status === "active").length;
  const totalRuns = recentRuns.length;
  const successRate =
    recentRuns.length > 0
      ? (recentRuns.filter((run) => run.status === "completed").length /
          recentRuns.length) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-walle-darkblue-base text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-walle-yellow">
              TASK Studio
            </h1>
            <p className="text-gray-400">
              Create and manage automated trading workflows
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-walle-blue hover:bg-walle-blue-dark"
            >
              + Create Task
            </Button>
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Tasks"
            value={tasks.length}
            accent="blue"
            hint="All configured tasks"
          />
          <KpiCard
            title="Active Tasks"
            value={activeTasks}
            accent="green"
            hint="Currently running"
          />
          <KpiCard
            title="Total Runs"
            value={totalRuns}
            accent="yellow"
            hint="All time executions"
          />
          <KpiCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            accent="cyan"
            hint="Last 24h"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-walle-surface rounded-lg p-6 border border-walle-blue/20">
              <h2 className="text-xl font-semibold mb-4 text-walle-yellow">
                Automation Tasks
              </h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {task.name}
                          </h3>
                          <StatusPill status={getStatusPill(task.status)} />
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Triggers:</span>
                            <div className="ml-2">
                              {task.triggers.map((trigger, index) => (
                                <div key={index} className="text-walle-blue">
                                  {formatTriggerDescription(trigger)}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Actions:</span>
                            <div className="ml-2">
                              {task.actions.map((action, index) => (
                                <div key={index} className="text-walle-yellow">
                                  {formatActionDescription(action)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRunTask(task.id)}
                          className="bg-walle-green hover:bg-green-600"
                          size="sm"
                          disabled={task.status === "running"}
                        >
                          Run Now
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                      {task.runCount && ` • Runs: ${task.runCount}`}
                      {task.lastRun &&
                        ` • Last run: ${new Date(task.lastRun).toLocaleString()}`}
                    </div>
                  </Card>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No automation tasks configured yet</p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 bg-walle-blue hover:bg-walle-blue-dark"
                    >
                      Create Your First Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Runs & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Runs */}
            <div className="bg-walle-surface rounded-lg p-6 border border-walle-blue/20">
              <h2 className="text-xl font-semibold mb-4 text-walle-yellow">
                Recent Runs
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentRuns.slice(0, 10).map((run) => (
                  <div
                    key={run.id}
                    className="p-3 bg-gray-800/50 rounded border border-gray-700/50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium text-white text-sm">
                        {run.task?.name || "Unknown Task"}
                      </div>
                      <StatusPill status={getStatusPill(run.status)} />
                    </div>
                    <div className="text-xs text-gray-500">
                      Started: {new Date(run.startedAt).toLocaleString()}
                      {run.finishedAt &&
                        ` • Finished: ${new Date(run.finishedAt).toLocaleString()}`}
                    </div>
                  </div>
                ))}
                {recentRuns.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p>No recent runs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-walle-surface rounded-lg p-6 border border-walle-blue/20">
              <h2 className="text-xl font-semibold mb-4 text-walle-yellow">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button className="w-full bg-walle-green hover:bg-green-600">
                  Run All Active Tasks
                </Button>
                <Button variant="secondary" className="w-full">
                  Pause All Tasks
                </Button>
                <Button variant="secondary" className="w-full">
                  View Task Logs
                </Button>
                <Button variant="secondary" className="w-full">
                  Export Task Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
