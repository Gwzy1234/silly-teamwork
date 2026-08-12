import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GuestRoute } from '../features/auth/components/GuestRoute'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ProjectTasksPage } from '../pages/ProjectTasksPage'
import { RegisterPage } from '../pages/RegisterPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TeamDetailPage } from '../pages/TeamDetailPage'
import { TeamsPage } from '../pages/TeamsPage'
import { TaskDetailPage } from '../pages/TaskDetailPage'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/teams', element: <TeamsPage /> },
          { path: '/teams/:teamId', element: <TeamDetailPage /> },
          { path: '/projects/:projectId', element: <ProjectDetailPage /> },
          { path: '/projects/:projectId/tasks', element: <ProjectTasksPage /> },
          { path: '/tasks/:taskId', element: <TaskDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
