import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from 'sonner';
import { db, httpsCallable } from '../config/config';

import UserForm from '../components/UserForm';
import UserTable from '../components/UsersTable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    puestoTrabajo: string;
    avatar: string;
}

export default function Controlpanel() {
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [editUsuario, setEditUsuario] = useState<User | null>(null);
    const [usuarios, setUsuarios] = useState<User[]>([]);

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        try {
            const usuariosCollection = collection(db, "usuarios");
            const usuariosSnapshot = await getDocs(usuariosCollection);

            const usuariosData: User[] = [];
            usuariosSnapshot.forEach((doc) => {
                const usuario = { id: doc.id, ...doc.data() } as User;
                usuariosData.push(usuario);
            });

            setUsuarios(usuariosData);
        } catch (error) {
            toast.error("Error al obtener la lista de usuarios");
        }
    };

    const handleEditarUsuario = async (usuario: User) => {
        setEditUsuario(usuario);
        setIsUserFormOpen(true);
    };

    const handleEliminarUsuario = (usuario: User) => {
        setUserToDelete(usuario);
        setShowDeleteModal(true);
    };

    const confirmarEliminarUsuario = async () => {
        if (userToDelete) {
            try {
                const deleteUserFunction = httpsCallable('deleteUser');
                await deleteUserFunction({ uid: userToDelete.id });

                obtenerUsuarios();
                toast.success("Usuario eliminado con éxito");
            } catch (error) {
                console.error(error);
                toast.error("Error al eliminar el usuario");
            }
        }
        setUserToDelete(null);
        setShowDeleteModal(false);
    };

    const handleUserFormClose = () => {
        setIsUserFormOpen(false);
        setEditUsuario(null);
        obtenerUsuarios();
    };

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <h1 className="text-xl font-semibold mb-4 text-center">Panel de Control de Usuarios</h1>
            <div className="flex flex-col p-4 max-w-4xl mx-auto shadow-inner rounded-xl overflow-x-auto">
                <UserForm
                    isOpen={isUserFormOpen}
                    onClose={handleUserFormClose}
                    editUser={editUsuario}
                    onUpdate={obtenerUsuarios}
                />

                <UserTable
                    usuarios={usuarios}
                    onAddNew={() => setIsUserFormOpen(true)}
                    onEdit={handleEditarUsuario}
                    onDelete={handleEliminarUsuario}
                    onRefresh={obtenerUsuarios}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onConfirm={confirmarEliminarUsuario}
                    onCancel={() => setShowDeleteModal(false)}
                />
            </div>
        </div>
    );
}