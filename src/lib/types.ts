
export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done" | "on-hold";

export interface User {
  id: string;
  email: string;
  // password will not be stored, this is a mock system
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // User ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isDeleted?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority: Priority;
  status: TaskStatus;
  projectId: string;
  // milestoneId?: string; // Optional milestone tracking
  timeSpent?: number; // in minutes
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isDeleted?: boolean;
  order: number; // For maintaining order within a status column
}

// For forms, partial types are often useful
export type ProjectFormData = Omit<Project, "id" | "ownerId" | "createdAt" | "updatedAt" | "isDeleted">;
export type TaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt" | "isDeleted" | "order">;
