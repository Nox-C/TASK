"use client";
import { Button, Card, Skeleton, StatusPill } from "@task/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Api, Task, TaskRun } from "../lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskRuns, setTaskRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    triggerType: "cron" as "cron" | "webhook",
    cronSchedule: "",
    webhookKey: "",
    actionType: "notify" as "bot.start" | "bot.stop" | "notify",
    botId: "",
    message: "",
    ownerId: "default-user", // Default owner for demo
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksData = await Api.tasks.list();
        setTasks(tasksData);
        setTaskRuns([]); // TODO: Implement task runs API
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        name: newTask.name,
        ownerId: newTask.ownerId,
        triggers: [
          {
            type: newTask.triggerType,
            config:
              newTask.triggerType === "cron"
                ? { schedule: newTask.cronSchedule }
                : { key: newTask.webhookKey },
          },
        ],
        actions: [
          {
            type: newTask.actionType,
            config:
              newTask.actionType === "notify"
                ? { message: newTask.message }
                : { botId: newTask.botId },
          },
        ],
      };

      const created: any = await Api.tasks.create(taskData);
      setTasks([...tasks, created]);
      setNewTask({
        name: "",
        triggerType: "cron",
        cronSchedule: "",
        webhookKey: "",
        actionType: "notify",
        botId: "",
        message: "",
        ownerId: "default-user",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-700 rounded" />
          </div>
          <Card className="p-6">
            <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-16" rounded="xl" />
              <Skeleton className="h-16" rounded="xl" />
              <Skeleton className="h-16" rounded="xl" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">TASK Studio</h1>
            <p className="text-gray-400">Create and manage automation tasks</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => setShowCreateForm(true)} variant="primary">
              Create Task
            </Button>
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={newTask.triggerType}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        triggerType: e.target.value as "cron" | "webhook",
                      })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="cron">Cron Schedule</option>
                    <option value="webhook">Webhook Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Action Type
                  </label>
                  <select
                    value={newTask.actionType}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        actionType: e.target.value as any,
                      })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="notify">Send Notification</option>
                    <option value="bot.start">Start Bot</option>
                    <option value="bot.stop">Stop Bot</option>
                  </select>
                </div>
              </div>

              {newTask.triggerType === "cron" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cron Schedule
                  </label>
                  <input
                    type="text"
                    value={newTask.cronSchedule}
                    onChange={(e) =>
                      setNewTask({ ...newTask, cronSchedule: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="0 */1 * * * (every hour)"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Format: minute hour day month weekday
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Webhook Key
                  </label>
                  <input
                    type="text"
                    value={newTask.webhookKey}
                    onChange={(e) =>
                      setNewTask({ ...newTask, webhookKey: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="unique-webhook-key"
                    required
                  />
                </div>
              )}

              {newTask.actionType === "notify" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <input
                    type="text"
                    value={newTask.message}
                    onChange={(e) =>
                      setNewTask({ ...newTask, message: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Notification message"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bot ID
                  </label>
                  <input
                    type="text"
                    value={newTask.botId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, botId: e.target.value })
                    }
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Bot ID to control"
                    required
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" variant="primary">
                  Create Task
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Tasks ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks created yet</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                  variant="primary"
                >
                  Create Your First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{task.name}</h3>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>
                        Trigger: {task.triggers[0]?.type || "None"}
                        {task.triggers[0]?.type === "cron" && (
                          <span className="ml-2 text-yellow-400">
                            {task.triggers[0].config.schedule}
                          </span>
                        )}
                      </div>
                      <div>Action: {task.actions[0]?.type || "None"}</div>
                      <div>
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Task Run History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Run History</h2>
            <div className="space-y-3">
              {taskRuns.map((run) => (
                <div key={run.id} className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Task Run</span>
                    <StatusPill
                      status={
                        (run.status === "completed"
                          ? "active"
                          : run.status === "failed"
                          ? "down"
                          : "degraded") as any
                      }
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    Started: {new Date(run.startedAt).toLocaleString()}
                    {run.finishedAt && (
                      <div>
                        Finished: {new Date(run.finishedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {taskRuns.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No task runs yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
