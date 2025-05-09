
"use client";
import type { User, Project, Task, TaskStatus, ProjectFormData, TaskFormData } from '@/lib/types';
import { LOCAL_STORAGE_USER_KEY, LOCAL_STORAGE_PROJECTS_KEY, LOCAL_STORAGE_TASKS_KEY } from '@/lib/constants';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Needs: npm install uuid && npm install @types/uuid

export interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string) => void; // Simplified login
  logout: () => void;
  isAuthenticated: boolean;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  addProject: (projectData: ProjectFormData) => Project;
  updateProject: (projectId: string, projectData: Partial<ProjectFormData>) => Project | undefined;
  deleteProject: (projectId: string) => void; // Soft delete
  getProjectById: (projectId: string) => Project | undefined;

  // Tasks
  tasks: Task[];
  getTasksByProjectId: (projectId: string | null) => Task[];
  getTasksByProjectIdAndStatus: (projectId: string | null, status: TaskStatus) => Task[];
  addTask: (taskData: TaskFormData) => Task;
  updateTask: (taskId: string, taskData: Partial<TaskFormData & { status?: TaskStatus, order?: number }>) => Task | undefined;
  deleteTask: (taskId: string) => void; // Soft delete
  getTaskById: (taskId: string) => Task | undefined;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number, targetProjectId?: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to get item from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

// Helper function to set item in localStorage
const setToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentUser(getFromLocalStorage<User | null>(LOCAL_STORAGE_USER_KEY, null));
    const storedProjects = getFromLocalStorage<Project[]>(LOCAL_STORAGE_PROJECTS_KEY, []);
    setProjects(storedProjects);
    const storedTasks = getFromLocalStorage<Task[]>(LOCAL_STORAGE_TASKS_KEY, []);
    setTasks(storedTasks);

    if (storedProjects.length > 0 && !activeProjectId) {
      setActiveProjectIdState(storedProjects.find(p => !p.isDeleted)?.id || null);
    } else if (storedProjects.length === 0) {
      setActiveProjectIdState(null);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setToLocalStorage(LOCAL_STORAGE_USER_KEY, currentUser);
  }, [currentUser, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setToLocalStorage(LOCAL_STORAGE_PROJECTS_KEY, projects);
     if (projects.length > 0 && (!activeProjectId || !projects.find(p => p.id === activeProjectId && !p.isDeleted))) {
      setActiveProjectIdState(projects.find(p => !p.isDeleted)?.id || null);
    } else if (projects.filter(p => !p.isDeleted).length === 0) {
      setActiveProjectIdState(null);
    }
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setToLocalStorage(LOCAL_STORAGE_TASKS_KEY, tasks);
  }, [tasks, isLoaded]);

  const login = (email: string) => {
    const user: User = { id: uuidv4(), email };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveProjectIdState(null); // Reset active project on logout
  };
  
  const setActiveProjectId = (projectId: string | null) => {
    setActiveProjectIdState(projectId);
  };

  const addProject = (projectData: ProjectFormData): Project => {
    if (!currentUser) throw new Error("User not authenticated");
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    setProjects(prev => [...prev, newProject]);
    if (!activeProjectId) setActiveProjectIdState(newProject.id);
    return newProject;
  };

  const updateProject = (projectId: string, projectData: Partial<ProjectFormData>): Project | undefined => {
    let updatedProject: Project | undefined;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        updatedProject = { ...p, ...projectData, updatedAt: new Date().toISOString() };
        return updatedProject;
      }
      return p;
    }));
    return updatedProject;
  };

  const deleteProject = (projectId: string) => { // Soft delete
    updateProject(projectId, { isDeleted: true });
    // If deleted project was active, set active project to another one or null
    if (activeProjectId === projectId) {
      const nextActiveProject = projects.find(p => p.id !== projectId && !p.isDeleted);
      setActiveProjectIdState(nextActiveProject?.id || null);
    }
    // Soft delete associated tasks
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.projectId === projectId ? { ...task, isDeleted: true, updatedAt: new Date().toISOString() } : task
      )
    );
  };
  
  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId && !p.isDeleted);

  const getTasksByProjectId = useCallback((projectId: string | null) => {
    if (!projectId) return tasks.filter(task => !task.isDeleted && !projects.find(p => p.id === task.projectId)?.isDeleted); // Tasks with no project or orphaned
    return tasks.filter(task => task.projectId === projectId && !task.isDeleted && !projects.find(p => p.id === task.projectId)?.isDeleted);
  }, [tasks, projects]);

  const getTasksByProjectIdAndStatus = useCallback((projectId: string | null, status: TaskStatus) => {
    return getTasksByProjectId(projectId)
      .filter(task => task.status === status)
      .sort((a, b) => a.order - b.order);
  }, [getTasksByProjectId]);

  const addTask = (taskData: TaskFormData): Task => {
    const tasksInStatus = getTasksByProjectIdAndStatus(taskData.projectId, taskData.status);
    const newOrder = tasksInStatus.length > 0 ? Math.max(...tasksInStatus.map(t => t.order)) + 1 : 0;

    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      order: newOrder,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: string, taskData: Partial<TaskFormData & { status?: TaskStatus, order?: number }>): Task | undefined => {
    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...taskData, updatedAt: new Date().toISOString() };
        return updatedTask;
      }
      return t;
    }));
    return updatedTask;
  };

  const deleteTask = (taskId: string) => { // Soft delete
    updateTask(taskId, { isDeleted: true });
  };

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId && !t.isDeleted);

  const moveTask = (taskId: string, newStatus: TaskStatus, newOrder: number, targetProjectId?: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId);
      if (!taskToMove) return prevTasks;

      const oldProjectId = taskToMove.projectId;
      const oldStatus = taskToMove.status;
      const finalProjectId = targetProjectId || oldProjectId;

      // Adjust orders in old column
      const remainingInOldColumn = prevTasks
        .filter(t => t.id !== taskId && t.projectId === oldProjectId && t.status === oldStatus)
        .sort((a, b) => a.order - b.order)
        .map((t, index) => ({ ...t, order: index }));

      // Adjust orders in new column (excluding the moved task for now)
      const tasksInNewColumn = prevTasks
        .filter(t => t.id !== taskId && t.projectId === finalProjectId && t.status === newStatus)
        .sort((a, b) => a.order - b.order);
      
      const updatedNewColumnTasks = [];
      let orderIndex = 0;
      for (let i = 0; i < tasksInNewColumn.length; i++) {
        if (orderIndex === newOrder) {
          orderIndex++; // Make space for the moved task
        }
        updatedNewColumnTasks.push({ ...tasksInNewColumn[i], order: orderIndex++ });
      }
       // If newOrder is at the end
      if (orderIndex === newOrder && tasksInNewColumn.length === newOrder) {
         // orderIndex is already incremented if newOrder was amongst existing items
      }


      const movedTask = { 
        ...taskToMove, 
        status: newStatus, 
        order: newOrder, 
        projectId: finalProjectId, 
        updatedAt: new Date().toISOString() 
      };

      return prevTasks
        .filter(t => t.id !== taskId) // Remove moved task
        .map(t => { // Apply order updates
          const updatedOld = remainingInOldColumn.find(uot => uot.id === t.id);
          if (updatedOld) return updatedOld;
          const updatedNew = updatedNewColumnTasks.find(unt => unt.id === t.id);
          if (updatedNew) return updatedNew;
          return t;
        })
        .concat(movedTask); // Add moved task back
    });
  };


  const isAuthenticated = !!currentUser;

  if (!isLoaded) {
     // You might want to render a loading spinner here or null
    return null;
  }

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, isAuthenticated,
      projects, activeProjectId, setActiveProjectId, addProject, updateProject, deleteProject, getProjectById,
      tasks, getTasksByProjectId, getTasksByProjectIdAndStatus, addTask, updateTask, deleteTask, getTaskById, moveTask
    }}>
      {children}
    </AppContext.Provider>
  );
};
