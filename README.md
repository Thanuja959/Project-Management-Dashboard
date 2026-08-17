# FlowBoard — Project Management Dashboard

FlowBoard is a modern, role-based project management dashboard built with React and TypeScript. It is designed as a frontend-focused alternative to tools such as Jira, Linear, and Trello, with separate capabilities for administrators and users.

## ✨ Features

### 🔐 Authentication & Roles
- Mock login system
- Admin and User roles
- Role-based dashboard and navigation
- Protected routes
- Local session persistence

### 👑 Admin Features
- Dashboard with project and task analytics
- Add, edit, and remove users
- Create, edit, and delete projects
- Create, edit, delete, and assign tasks
- Assign projects and tasks to users
- Manage deadlines and priorities
- View team productivity
- View all project/task activity
- Send user/project/task emails through EmailJS
- Manage notifications

### 👤 User Features
- Personal dashboard
- View assigned projects
- View assigned tasks
- Update task status
- Update completed hours/time
- View personal progress
- View upcoming deadlines
- Receive notifications

Users cannot modify task details controlled by administrators, such as title, description, priority, assignee, project, or deadline.

### 📋 Task Management
- Kanban board
- Drag-and-drop task management
- List/table view
- Task creation and editing
- Task priorities
- Task statuses
- Due dates
- Estimated and completed hours
- Search
- Advanced filtering
- Sorting

### 📅 Calendar
- Calendar-based task view
- Due-date visualization
- Role-based task visibility

### 📊 Analytics
- Task completion charts
- Project progress
- Task status distribution
- Team/user productivity
- Personal user progress

### 🔔 Notifications
- Task assignments
- Project assignments
- Task status changes
- Task completion
- Upcoming deadlines
- Read/unread notifications

### 📧 Email
EmailJS is used for frontend email delivery.

Examples:
- Welcome email when a user is created
- Project assignment email
- Task assignment email

For local development, dashboard links can point to `http://localhost:5173/login`.

> Note: A localhost URL can only be opened on a device that can access the running local server. For a publicly accessible dashboard link, deploy the application and update the URL.

### ⌨️ Productivity
- `Ctrl + K` — Command palette
- `/` — Search
- `N` — Create task (Admin)
- `Esc` — Close modal
- `G` then `D` — Dashboard
- `G` then `P` — Projects

### 🌙 UI & UX
- Dark/light theme
- Responsive desktop, tablet, and mobile layouts
- Reusable components
- Toast notifications
- Loading states
- Empty states
- Error states
- Accessible controls
- Smooth animations

### 💾 Local Persistence
The application uses `localStorage` for frontend persistence.

Stored information can include:
- Users
- Projects
- Tasks
- Notifications
- Current session
- Theme preference

This makes the application dynamic without requiring a backend/database.

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **Zustand**
- **Tailwind CSS**
- **Recharts**
- **dnd-kit**
- **EmailJS**
- **Lucide React**
- **Framer Motion**

## 📁 Project Structure

```text
src/
├── components/
│   ├── Sidebar/
│   ├── Navbar/
│   ├── TaskCard/
│   ├── TaskModal/
│   ├── ProjectCard/
│   ├── ProjectModal/
│   ├── UserModal/
│   ├── NotificationPanel/
│   ├── CommandPalette/
│   └── ...
│
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── Users/
│   ├── Projects/
│   ├── Tasks/
│   ├── Calendar/
│   ├── Analytics/
│   ├── Notifications/
│   └── Settings/
│
├── layouts/
│   └── DashboardLayout/
│
├── routes/
│   └── ...
│
├── store/
│   └── dataStore.ts
│
├── services/
│   └── emailService.ts
│
├── types/
│   └── ...
│
├── utils/
│   └── ...
│
└── data/
    └── mockData.ts
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## 🔑 Demo Accounts

The application can use mock accounts such as:

### Admin

```text
Email: admin@example.com
Password: admin123
```

### User

```text
Email: user@example.com
Password: user123
```

Additional demo users can be created from the Admin Users page.

> Change demo credentials before using the project in any real environment.

## 📧 EmailJS Configuration

Create an EmailJS account and configure an email service and template.

Add your EmailJS values to the email service configuration:

```ts
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

Recommended template variables:

```text
{{to_name}}
{{to_email}}
{{subject}}
{{message}}
{{dashboard_link}}
```

Do not place private SMTP passwords or other secret credentials in the React frontend.

## 🔄 Application Flow

### Admin Flow

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Create User
    ↓
Send Welcome Email
    ↓
Create Project
    ↓
Assign Project to User
    ↓
Create & Assign Tasks
    ↓
Monitor Progress
```

### User Flow

```text
User Login
    ↓
User Dashboard
    ↓
View Assigned Projects
    ↓
View Assigned Tasks
    ↓
Update Task Status
    ↓
Update Completed Hours
    ↓
Admin Sees Updated Progress
```

## 🔐 Role Permissions

| Feature | Admin | User |
|---|:---:|:---:|
| Dashboard | ✅ | ✅ |
| View Users | ✅ | ❌ |
| Add/Edit/Delete Users | ✅ | ❌ |
| Create Projects | ✅ | ❌ |
| Edit/Delete Projects | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ |
| Create Tasks | ✅ | ❌ |
| Edit/Delete Tasks | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| Update Completed Hours | ✅ | ✅ |
| Calendar | All tasks | Own tasks |
| Analytics | Team/Project | Personal |
| Notifications | ✅ | ✅ |
| Dark/Light Mode | ✅ | ✅ |

## 🧠 Architecture

FlowBoard follows a role-aware frontend architecture:

```text
                 React Application
                        │
              ┌─────────┴─────────┐
              │                   │
            ADMIN                USER
              │                   │
       Full management       Limited actions
              │                   │
              └─────────┬─────────┘
                        ↓
                Zustand Store
                        ↓
                   localStorage
```

The application uses one shared dashboard layout while conditionally displaying navigation, data, and actions based on the authenticated user's role.

## ⚠️ Current Limitations

This project is primarily a frontend demonstration.

- Data is stored locally in the browser.
- There is no central backend database.
- Multiple devices do not automatically share the same localStorage data.
- Authentication is mock authentication and should not be treated as production security.
- EmailJS provides email delivery, but production applications should use secure backend/serverless architecture for sensitive workflows.
- Passwords should not be sent through email in a real production application; a secure password setup/reset flow should be used instead.

## 🔮 Future Improvements

Possible production upgrades:

- Node.js/Express or another backend
- PostgreSQL/MongoDB/Supabase database
- Real authentication and authorization
- Secure password hashing
- Password reset flow
- Real-time updates with WebSockets
- Cloud file storage
- Audit logs
- Role/permission management
- Automated email service
- Deployment and CI/CD
- Unit and integration testing

## 🎯 Project Goal

FlowBoard demonstrates practical frontend engineering through:

- Role-based UI and access control
- State management
- CRUD operations
- Drag-and-drop interactions
- Data visualization
- Search/filter/sort functionality
- Local persistence
- Responsive design
- Accessibility
- Keyboard shortcuts
- Email integration
- Reusable component architecture

The goal is to build a polished, realistic internal company tool rather than a collection of static pages.

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.
