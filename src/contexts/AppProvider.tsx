"use client";
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { app } from '@/app/layout';
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, runTransaction, DocumentSnapshot } from 'firebase/firestore';

// Assuming these types are defined elsewhere and correctly imported
interface Project {
  id: string;
  name: string;
  isDeleted: boolean;
  // Add other project properties as needed
}

interface ProjectFormData {
  name: string;
  // Add other form data properties as needed
}

type TaskStatus = 'todo' | 'in-progress' | 'done'; // Example statuses

interface Task {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  order: number;
  isDeleted: boolean;
  // Add other task properties as needed
}

interface TaskFormData {
  projectId: string;
  name: string;
  status: TaskStatus;
  // Add other form data properties as needed
}

interface Milestone {
  id: string;
  projectId: string;
  name: string;
  order: number;
  isDeleted: boolean;
  // Add other milestone properties as needed
}

interface MilestoneFormData {
  projectId: string;
  name: string;
  // Add other form data properties as needed
}

export interface AppContextType {
  // Auth
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  // Projects
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  addProject: (projectData: ProjectFormData) => Promise<string>; // Changed return to Promise<string>
  updateProject: (projectId: string, projectData: Partial<ProjectFormData>) => Promise<Project | undefined>; // Changed return to Promise
  deleteProject: (projectId: string) => void;
  logout: () => void;
  getProjectById: (projectId: string) => Project | undefined;

  // Tasks
  tasks: Task[];
  getTasksByProjectId: (projectId: string | null) => Task[];
  getTasksByProjectIdAndStatus: (projectId: string | null, status: TaskStatus) => Task[];
  addTask: (taskData: TaskFormData) => Promise<string>; // Changed return to Promise<string>
  updateTask: (taskId: string, taskData: Partial<TaskFormData & { status?: TaskStatus, order?: number }>) => Promise<Task | undefined>; // Changed return to Promise
  deleteTask: (taskId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number, targetProjectId?: string) => Promise<void>; // Changed return to Promise<void>

  // Milestones
  milestones: Milestone[];
  getMilestonesByProjectId: (projectId: string) => Milestone[];
  getMilestoneById: (milestoneId: string) => Milestone | undefined;
  addMilestone: (milestoneData: MilestoneFormData) => Promise<Milestone>; // Changed return to Promise<Milestone>
  updateMilestone: (milestoneId: string, milestoneData: Partial<MilestoneFormData>) => Promise<Milestone | undefined>; // Changed return to Promise
  deleteMilestone: (milestoneId: string) => Promise<void>; // Changed return to Promise<void>
}


export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to transform Firestore DocumentSnapshot to Project/Task/Milestone type
  const snapshotToData = <T extends { id: string }>(doc: DocumentSnapshot): T => {
    return { id: doc.id, ...(doc.data() as Omit<T, 'id'>) };
  };

  // Firebase Auth State Listener and Firestore Data Listeners
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoaded(true);
    });

    if (!isLoaded || !currentUser) {
      setProjects([]);
      setTasks([]);
      setMilestones([]);
      setActiveProjectIdState(null);
      return;
    }

    const db = getFirestore(app);
    const userUid = currentUser.uid;

    // Projects Listener
    const projectsCollection = collection(db, `users/${userUid}/projects`);
    const unsubscribeProjects = onSnapshot(projectsCollection, (snapshot) => {
      const fetchedProjects: Project[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Project, 'id'>)
      }));
      setProjects(fetchedProjects);
      if (fetchedProjects.length > 0 && (!activeProjectId || !fetchedProjects.find(p => p.id === activeProjectId && !p.isDeleted))) {
        setActiveProjectIdState(fetchedProjects.find(p => !p.isDeleted)?.id || null);
      } else if (fetchedProjects.filter(p => !p.isDeleted).length === 0) {
        setActiveProjectIdState(null);
      }
    }, (error) => {
      console.error("Error fetching projects:", error);
    });

    // Tasks Listener (Conditional on activeProjectId)
    let unsubscribeTasks: () => void = () => {};
    if (activeProjectId) {
      const tasksCollection = collection(db, `users/${userUid}/projects/${activeProjectId}/tasks`);
      unsubscribeTasks = onSnapshot(tasksCollection, (snapshot) => {
        const fetchedTasks: Task[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, 'id'>)
        }));
        setTasks(fetchedTasks);
      }, (error) => {
        console.error("Error fetching tasks:", error);
      });
    } else {
      setTasks([]); // Clear tasks if no project is active
    }

    // Milestones Listener
    const milestonesCollection = collection(db, `users/${userUid}/milestones`);
    const unsubscribeMilestones = onSnapshot(milestonesCollection, (snapshot) => {
      const fetchedMilestones: Milestone[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Milestone, 'id'>)
      }));
      setMilestones(fetchedMilestones);
    }, (error) => {
      console.error("Error fetching milestones:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
      unsubscribeTasks(); // This will be the no-op function if activeProjectId is null
      unsubscribeMilestones();
    };

  }, [currentUser, isLoaded, activeProjectId]);

  const logout = () => {
    signOut(getAuth(app)).catch(error => console.error("Error signing out:", error));
    setActiveProjectIdState(null);
  };

  const setActiveProjectId = (projectId: string | null) => {
    setActiveProjectIdState(projectId);
  };

  const addProject = async (projectData: ProjectFormData): Promise<string> => {
    if (!currentUser?.uid) throw new Error("User not authenticated");
    const db = getFirestore(app);
    const projectsCollection = collection(db, `users/${currentUser.uid}/projects`);

    try {
      const docRef = await addDoc(projectsCollection, {
        ...projectData,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, projectData: Partial<ProjectFormData>): Promise<Project | undefined> => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for updateProject");
      return undefined;
    }
    const db = getFirestore(app);
    const projectDoc = doc(db, `users/${currentUser.uid}/projects`, projectId);

    const updateData: Partial<Project> = {
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(projectDoc, updateData);
      return undefined; // State update is handled by the onSnapshot listener
    } catch (error) {
      console.error("Error updating project:", error);
      return undefined;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for deleteProject");
      return;
    }
    const db = getFirestore(app);
    const projectDoc = doc(db, `users/${currentUser.uid}/projects`, projectId);

    try {
      await updateDoc(projectDoc, { isDeleted: true, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId && !p.isDeleted);

  const getTasksByProjectId = useCallback((projectId: string | null) => {
    if (!projectId) return tasks.filter(task => !task.isDeleted && !projects.find(p => p.id === task.projectId)?.isDeleted);
    return tasks.filter(task => task.projectId === projectId && !task.isDeleted && !projects.find(p => p.id === task.projectId)?.isDeleted);
  }, [tasks, projects]);

  const getTasksByProjectIdAndStatus = useCallback((projectId: string | null, status: TaskStatus) => {
    return getTasksByProjectId(projectId)
      .filter(task => task.status === status)
      .sort((a, b) => a.order - b.order);
  }, [getTasksByProjectId]);

  const addTask = async (taskData: TaskFormData): Promise<string> => {
    if (!currentUser?.uid) throw new Error("User not authenticated");
    const db = getFirestore(app);
    const tasksCollection = collection(db, `users/${currentUser.uid}/projects/${taskData.projectId}/tasks`);

    const tasksInStatus = getTasksByProjectIdAndStatus(taskData.projectId, taskData.status);
    const newOrder = tasksInStatus.length > 0 ? Math.max(...tasksInStatus.map(t => t.order)) + 1 : 0;

    try {

      // Prepare task data, handling potential undefined values like dueDate
      const taskDataToSend: any = {};
      for (const key in taskData) {
        if (taskData[key as keyof TaskFormData] !== undefined) {
          taskDataToSend[key] = taskData[key as keyof TaskFormData];
        }
      }

      const docRef = await addDoc(tasksCollection, {
        ...taskDataToSend,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        order: newOrder,
      });
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<TaskFormData & { status?: TaskStatus, order?: number }>): Promise<Task | undefined> => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for updateTask");
      return undefined;
    }
    const db = getFirestore(app);
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return undefined;

    const taskDoc = doc(db, `users/${currentUser.uid}/projects/${taskToUpdate.projectId}/tasks`, taskId);

    const updateData: Partial<Task> = {
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(taskDoc, updateData);
      return undefined;
    } catch (error) {
      console.error("Error updating task:", error);
      return undefined;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for deleteTask");
      return;
    }
    const db = getFirestore(app);
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      const taskDoc = doc(db, `users/${currentUser.uid}/projects/${taskToDelete.projectId}/tasks`, taskId);
      await updateDoc(taskDoc, { isDeleted: true, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId && !t.isDeleted);

  const getMilestonesByProjectId = (projectId: string) =>
    milestones.filter(m => m.projectId === projectId && !m.isDeleted).sort((a, b) => a.order - b.order);

  const getMilestoneById = (milestoneId: string) =>
    milestones.find(m => m.id === milestoneId && !m.isDeleted);

  const addMilestone = async (milestoneData: MilestoneFormData): Promise<Milestone> => {
    if (!currentUser?.uid) throw new Error("User not authenticated for addMilestone");
    const db = getFirestore(app);
    const milestonesCollection = collection(db, `users/${currentUser.uid}/milestones`);

    const projectMilestones = getMilestonesByProjectId(milestoneData.projectId);
    const order = projectMilestones.length > 0 ? Math.max(...projectMilestones.map(m => m.order)) + 1 : 0;

    let newMilestoneId: string | undefined;
    try {
      const docRef = await addDoc(milestonesCollection, {
        ...milestoneData,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        order: order,
      });
      newMilestoneId = docRef.id;
    } catch (error) {
      console.error("Error adding milestone:", error);
      throw error;
    }
    // Note: The returned milestone will have a temporary object structure until onSnapshot updates state.
    return { id: newMilestoneId!, ...milestoneData, ownerId: currentUser.uid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDeleted: false, order: order };
  };

  const updateMilestone = async (milestoneId: string, milestoneData: Partial<MilestoneFormData>): Promise<Milestone | undefined> => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for updateMilestone");
      return undefined;
    }
    const db = getFirestore(app);
    const milestoneDoc = doc(db, `users/${currentUser.uid}/milestones`, milestoneId);

    const updateData: Partial<Milestone> = {
      ...milestoneData,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(milestoneDoc, updateData);
      return undefined;
    } catch (error) {
      console.error("Error updating milestone:", error);
      return undefined;
    }
  };

  const deleteMilestone = async (milestoneId: string): Promise<void> => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for deleteMilestone");
      return;
    }
    const db = getFirestore(app);
    const milestoneDoc = doc(db, `users/${currentUser.uid}/milestones`, milestoneId);

    try {
      await updateDoc(milestoneDoc, { isDeleted: true, updatedAt: new Date().toISOString() }); // Soft delete
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newOrder: number, targetProjectId?: string) => {
    if (!currentUser?.uid) {
      console.error("User not authenticated for moveTask");
      return;
    }
    const db = getFirestore(app);
    const userUid = currentUser.uid; // Get user UID once

    let initialOldProjectId: string | undefined;
    // Use the local state to get a potential initial projectId, but rely on transaction read for final check
    const taskFromLocalState = tasks.find(t => t.id === taskId);
    if (taskFromLocalState) {
        initialOldProjectId = taskFromLocalState.projectId;
    } else {
        console.error("Task not found in local state for moveTask:", taskId);
         // We'll attempt to read within the transaction, but might need a project ID hint.
         // If targetProjectId is provided, we might assume it's coming from that project.
         // If not, this transaction might fail without a projectId hint.
         if (!targetProjectId) throw new Error("Cannot move task: Task not found locally and no target project provided.");
    }

     const finalProjectId = targetProjectId || initialOldProjectId!; // Use targetProjectId if provided, otherwise rely on initialOldProjectId

    // We'll perform the move in transaction, even if status/order seem the same,
    // to ensure order integrity in the column. The transaction handles atomicity.

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Get the task document within the transaction
        // We need a potential project ID to start the read. Use the initialOldProjectId or targetProjectId if available.
        const projectIdHint = initialOldProjectId || targetProjectId;
        if (!projectIdHint) throw new Error("Cannot get task document: No project ID hint available.");

        const taskDocRef = doc(db, `users/${userUid}/projects/${projectIdHint}/tasks`, taskId);
        const taskDoc = await transaction.get(taskDocRef);

        if (!taskDoc.exists()) {
          // If it doesn't exist in the hinted project, it might have been moved or deleted.
          // Try searching across all projects if necessary, but for now, throw error.
           throw new Error("Task does not exist or is not in the expected project!");
        }

        const taskToMove = snapshotToData<Task>(taskDoc);
        const oldProjectId = taskToMove.projectId; // Get the authoritative oldProjectId from the document
        const oldStatus = taskToMove.status; // Get the authoritative oldStatus from the document

        if (!oldProjectId) {
          // This should ideally not happen if the task document was fetched successfully, but as a safeguard:
          throw new Error(`Task with ID ${taskId} found in transaction but has no projectId.`);
        }

         // If the task is not actually moving project or status, and order is already correct, we can potentially stop here
         // However, re-ordering the source column is always needed if the task leaves it.
         // Let's proceed with re-ordering both columns for simplicity and robustness.

        // 2. Query tasks in the OLD column (before move) - use the authoritative oldProjectId and oldStatus
        const oldColumnTasksCollection = collection(db, `users/${userUid}/projects/${oldProjectId}/tasks`);
        const oldColumnQuery = query(
          oldColumnTasksCollection,
          where('status', '==', oldStatus),
          where('isDeleted', '==', false)
        );
        console.log('oldColumnQuery:', oldColumnQuery);
        const oldColumnSnapshot = await transaction.get(oldColumnQuery);
        const tasksInOldColumn: Task[] = oldColumnSnapshot.docs
          .map(doc => snapshotToData<Task>(doc))
          .filter(t => t.id !== taskId); // Exclude the task being moved

        // 3. Query tasks in the NEW column (after move) - use the finalProjectId and newStatus
        const newColumnTasksCollection = collection(db, `users/${userUid}/projects/${finalProjectId}/tasks`);
        const newColumnQuery = query(
          newColumnTasksCollection,
          where('status', '==', newStatus),
          where('isDeleted', '==', false)
        );
        const newColumnSnapshot = await transaction.get(newColumnQuery);
        const tasksInNewColumn: Task[] = newColumnSnapshot.docs
          .map(doc => snapshotToData<Task>(doc))
          .filter(t => t.id !== taskId); // Always exclude the task being moved from the list before inserting it


        // Adjust orders in the OLD column if the task is moving out or just changing status within the same project
        if (oldProjectId !== finalProjectId || oldStatus !== newStatus) {
            tasksInOldColumn
                .sort((a, b) => a.order - b.order)
                .forEach((t, index) => {
                    const docRef = doc(db, `users/${userUid}/projects/${oldProjectId}/tasks`, t.id);
                    transaction.update(docRef, { order: index });
                });
        }


        // Adjust orders in the NEW column
        const allTasksInNewColumnIncludingMoved = [...tasksInNewColumn];
        // Add the moved task's potential new position and properties for accurate re-ordering calculation
        // Ensure we use the updated status, project ID, and new order for the moved task in this calculation
        allTasksInNewColumnIncludingMoved.splice(newOrder, 0, { ...taskToMove, status: newStatus, projectId: finalProjectId, order: newOrder });

        allTasksInNewColumnIncludingMoved
            .sort((a, b) => a.order - b.order) // Initial sort to prepare for re-ordering
            .forEach((t, index) => {
                const docRef = doc(db, `users/${userUid}/projects/${t.projectId}/tasks`, t.id); // Ensure correct project path based on the task's final location
                // Only update if the order needs changing to avoid unnecessary writes
                if (t.order !== index) {
                     transaction.update(docRef, { order: index });
                }
            });


        // Update the moved task's properties or move the document
        // If the task is moving to a different project, its document reference must change
        if (oldProjectId !== finalProjectId) {
            // To move a document in Firestore within a transaction, you read it, delete the old one, and set a new one.
            // Read was already done at step 1.

            // Delete the old document
            const oldTaskDocRef = doc(db, `users/${userUid}/projects/${oldProjectId}/tasks`, taskId);
            transaction.delete(oldTaskDocRef);

            // Create a new document in the new project's tasks collection with the same ID
            const newTaskDocRef = doc(db, `users/${userUid}/projects/${finalProjectId}/tasks`, taskId);
            transaction.set(newTaskDocRef, {
                ...taskToMove, // All original task data
                status: newStatus,
                order: newOrder,
                projectId: finalProjectId,
                updatedAt: new Date().toISOString(),
                 // Ensure ownerId is carried over if it exists
                 ...(taskToMove.ownerId && { ownerId: taskToMove.ownerId })
            });
        } else {
            // If staying in the same project, just update the existing document
            // Need to re-get the doc ref as it's within the transaction scope
             const taskInSameProjectRef = doc(db, `users/${userUid}/projects/${oldProjectId}/tasks`, taskId);


            transaction.update(taskInSameProjectRef, {
                status: newStatus,
                order: newOrder,
                projectId: finalProjectId, // This might be redundant if projectId is the same, but good for clarity
                updatedAt: new Date().toISOString(),
            });
        }
      });
    } catch (error) {
      console.error("Error moving task:", error);
      throw error; // Re-throw for caller to handle
    }
  };

  const isAuthenticated = !!currentUser;

  if (!isLoaded) {
    return null;
  }

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, logout,
      projects, activeProjectId, setActiveProjectId, addProject, updateProject, deleteProject, getProjectById,
      tasks, getTasksByProjectId, getTasksByProjectIdAndStatus, addTask, updateTask, deleteTask, getTaskById, moveTask,
      milestones, getMilestonesByProjectId, getMilestoneById, addMilestone, updateMilestone, deleteMilestone
    }}>
      {children}
    </AppContext.Provider>
  );
};
      