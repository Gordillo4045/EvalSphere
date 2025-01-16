import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from "@heroui/react";

interface ProtectedCompanyRouteProps {
    children: React.ReactNode;
}

const ProtectedCompanyRoute: React.FC<ProtectedCompanyRouteProps> = ({ children }) => {
    const { user, isCompany, loading } = useAuth();

    if (loading) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando..." />
        </div>;
    }

    if (!user || !isCompany) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedCompanyRoute;
