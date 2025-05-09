
import type { TaskStatus, Priority } from "./types";

export const LOCAL_STORAGE_USER_KEY = "taskTicker_user";
export const LOCAL_STORAGE_PROJECTS_KEY = "taskTicker_projects";
export const LOCAL_STORAGE_TASKS_KEY = "taskTicker_tasks";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in-progress", "done", "on-hold"];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export const STATUS_DISPLAY_NAMES: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
  "on-hold": "On Hold",
};

export const PRIORITY_DISPLAY_NAMES: Record<Priority, string> = {
  "low": "Low",
  "medium": "Medium",
  "high": "High",
};
