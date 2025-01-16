import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from "@heroui/react";

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className='text-center w-full h-full flex items-center justify-center'>
            <Spinner color="primary" label="Cargando..." />
        </div>;
    }

    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;