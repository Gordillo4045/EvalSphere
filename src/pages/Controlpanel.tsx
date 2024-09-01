import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../config/config";
import { toast } from 'sonner';
import { deleteUser } from "firebase/auth";

import UserForm from '../components/UserForm';
import UserTable from '../components/UsersTable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Usuario {
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
    const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
    const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        try {
            const usuariosCollection = collection(db, "usuarios");
            const usuariosSnapshot = await getDocs(usuariosCollection);

            const usuariosData: Usuario[] = [];
            usuariosSnapshot.forEach((doc) => {
                const usuario = { id: doc.id, ...doc.data() } as Usuario;
                usuariosData.push(usuario);
            });

            setUsuarios(usuariosData);
        } catch (error) {
            toast.error("Error al obtener la lista de usuarios");
        }
    };

    const handleEditarUsuario = async (usuario: Usuario) => {
        setEditUsuario(usuario);
        setIsUserFormOpen(true);
    };

    const handleEliminarUsuario = (usuario: Usuario) => {
        setUserToDelete(usuario);
        setShowDeleteModal(true);
    };

    const confirmarEliminarUsuario = async () => {
        if (userToDelete) {
            try {
                // Eliminar usuario de Firebase Authentication
                const user = auth.currentUser;
                if (user) {
                    await deleteUser(user);
                }

                // Eliminar usuario de Firestore
                const usuariosCollection = collection(db, "usuarios");
                await deleteDoc(doc(usuariosCollection, userToDelete.id));

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
        <div className="container min-h-screen md:mx-auto">
            <h1 className="text-2xl font-bold mb-4">Panel de Control de Usuarios</h1>
            <div className="flex flex-row p-4 max-w-4xl md:mx-auto shadow-inner rounded-xl mx-4">
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