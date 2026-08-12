import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

export function GuestRoute() {
  const sessionIsValid = useAuthStore((state) => state.hasValidSession())
  return sessionIsValid ? <Navigate to="/dashboard" replace /> : <Outlet />
}
