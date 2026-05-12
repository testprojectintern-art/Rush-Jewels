import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Save attempted location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for user object to be available (zustand hydration)
    if (!user) {
        return null;
    }

    // Role-based guard (optional)
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}