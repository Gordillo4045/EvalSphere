import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from "@heroui/react";

interface ProtectedUserRouteProps {
    children: React.ReactNode;
}

const ProtectedUserRoute: React.FC<ProtectedUserRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando..." />
        </div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedUserRoute;
