# **App Name**: Task Ticker

## Core Features:

- Task Creation: Add tasks with a title, description, due dates, and priority.  Minimal input fields with clear labels.
- Kanban Board: Visually show progression to mark tasks as in progress, done, on hold, etc. using distinct color-coded statuses. Drag and drop tasks to different status columns
- Project Organization: Organize tasks by projects. A project filter that shows tasks associated with the given project. Optional milestone categorization.
- Secure Login: Basic login system with email and password, storing user data locally in browser storage, no dedicated database

## Team Collaboration:

- Team Creation: Users can create teams with a name.
- Team Management UI: A collapsable right sidebar will be used to manage teams and members.
- Project Assignment: Assign projects to a team.
- Task Assignment: Assign tasks to individual team members within the assigned project's team.


## Style Guidelines:

- Primary color: Calm blue (#4682B4) to convey professionalism and focus.
- Secondary color: Light gray (#D3D3D3) for backgrounds and less important elements.
- Accent: Teal (#008080) for interactive elements and calls to action, to provide a modern feel.
- Clean and readable sans-serif font for task titles and descriptions.
- Simple and clear icons to represent task statuses and project categories.
- Clear and efficient drag and drop of cards, as per the kanban methodology

## API Endpoints Specification

### **Authentication**

#### `POST /api/auth/login`
- **Description:** Log in user with email and password.
- **Request body:**
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",           // JWT or session token
    "user": {
      "id": "string",
      "email": "user@example.com",
      "name": "string"
    }
  }
  ```

#### `POST /api/auth/register`
- **Description:** Register a new user account.
- **Request body:**
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "name": "string"
  }
  ```
- **Response:** Same as login

#### `POST /api/auth/logout`
- **Description:** Log out the current user.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  {
    "success": true
  }
  ```

### **Tasks**

#### `GET /api/tasks`
- **Description:** Get all tasks for the authenticated user (optionally filter by project).
- **Query params:** `?projectId=string`
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "todo" | "in-progress" | "done" | "on-hold",
      "priority": "low" | "medium" | "high",
      "dueDate": "2024-06-01T00:00:00Z",
      "projectId": "string",
      "createdAt": "2024-05-21T15:00:00Z",
      "updatedAt": "2024-05-21T18:00:00Z"
    }
  ]
  ```

#### `POST /api/tasks`
- **Description:** Create a new task.
- **Headers:** Authorization: Bearer {token}
- **Request body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "priority": "low" | "medium" | "high",
    "dueDate": "2024-06-01T00:00:00Z",
    "status": "todo" | "in-progress" | "done" | "on-hold",
    "projectId": "string"
  }
  ```
- **Response:** Newly created task object.

#### `GET /api/tasks/:id`
- **Description:** Get a specific task by its ID.
- **Headers:** Authorization: Bearer {token}
- **Response:** Task object.

#### `PUT /api/tasks/:id`
- **Description:** Update an existing task (any field).
- **Headers:** Authorization: Bearer {token}
- **Request body:** Any updatable task field.
- **Response:** Updated task object.

#### `DELETE /api/tasks/:id`
- **Description:** Delete a task.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  {
    "success": true
  }
  ```

### **Projects**

#### `GET /api/projects`
- **Description:** Get all projects for the authenticated user.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "createdAt": "2024-05-21T00:00:00Z",
      "updatedAt": "2024-05-21T00:00:00Z"
    }
  ]
  ```

#### `POST /api/projects`
- **Description:** Create a new project.
- **Headers:** Authorization: Bearer {token}
- **Request body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response:** Newly created project object.

#### `GET /api/projects/:id`
- **Description:** Get a single project.
- **Headers:** Authorization: Bearer {token}
- **Response:** Project object.

#### `PUT /api/projects/:id`
- **Description:** Update project details.
- **Headers:** Authorization: Bearer {token}
- **Request body:** Any updatable project field.
- **Response:** Updated project object.

#### `DELETE /api/projects/:id`
- **Description:** Delete the project and all associated tasks.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  {
    "success": true
  }
  ```

### **Milestones**

#### `GET /api/projects/:projectId/milestones`
- **Description:** List all milestones for a project.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "dueDate": "2024-06-10T00:00:00Z"
    }
  ]
  ```

#### `POST /api/projects/:projectId/milestones`
- **Description:** Add a new milestone to a project.
- **Headers:** Authorization: Bearer {token}
- **Request body:**
  ```json
  {
    "title": "string",
    "dueDate": "2024-06-10T00:00:00Z"
  }
  ```
- **Response:** Newly created milestone object.

#### `DELETE /api/projects/:projectId/milestones/:milestoneId`
- **Description:** Delete a milestone.
- **Headers:** Authorization: Bearer {token}
- **Response:**
  ```json
  {
    "success": true
  }
  ```

### **Enums/Options**

#### `GET /api/enums`
- **Description:** Get possible values for statuses and priorities.
- **Response:**
  ```json
  {
    "statuses": ["todo", "in-progress", "done", "on-hold"],
    "priorities": ["low", "medium", "high"]
  }
  ```

### **Implementation Notes**
- For the browser-based implementation, these endpoints will be simulated using browser storage.
- All authentication tokens will be stored in localStorage.
- Data persistence will be handled through localStorage or IndexedDB.
- All date fields use ISO8601 format.
