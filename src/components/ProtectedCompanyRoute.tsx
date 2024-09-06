import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedCompanyRouteProps {
    children: React.ReactNode;
}

const ProtectedCompanyRoute: React.FC<ProtectedCompanyRouteProps> = ({ children }) => {
    const { user, isCompany, loading } = useAuth();

    if (loading) {
        return <div className='text-center w-full h-full flex items-center justify-center'>Cargando...</div>;
    }

    if (!user || !isCompany) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedCompanyRoute;
