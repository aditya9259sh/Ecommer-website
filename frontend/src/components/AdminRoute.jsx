import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute
