import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = ({ allowedRoles = ['admin', 'superadmin', 'staff', 'pharmacist'] }) => {
    const { user, isLoading, token } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // Not logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role check
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
