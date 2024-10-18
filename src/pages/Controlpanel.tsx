import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from 'sonner';
import { db, httpsCallable } from '../config/config';
import { Tabs, Tab } from "@nextui-org/react";

import UserForm from '../components/UserForm';
import UserTable from '../components/UsersTable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Usuario {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    puestoTrabajo?: string;
    avatar?: string;
}

export default function Controlpanel() {
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);
    const [editItem, setEditItem] = useState<Usuario | null>(null);
    const [adminUsuarios, setAdminUsuarios] = useState<Usuario[]>([]);
    const [companyUsuarios, setCompanyUsuarios] = useState<Usuario[]>([]);
    const [selectedTab, setSelectedTab] = useState("companias");
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        try {
            const usuariosCollection = collection(db, "users");
            const usuariosSnapshot = await getDocs(usuariosCollection);

            const adminData: Usuario[] = [];
            const companyData: Usuario[] = [];

            usuariosSnapshot.forEach((doc) => {
                const usuario = { id: doc.id, ...doc.data() } as Usuario;
                if (usuario.role === 'admin') {
                    adminData.push(usuario);
                } else if (usuario.role === 'company') {
                    companyData.push(usuario);
                }
            });

            setAdminUsuarios(adminData);
            setCompanyUsuarios(companyData);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            toast.error("Error al obtener la lista de usuarios");
        }
    };

    const handleEditar = async (item: Usuario) => {
        setEditItem(item);
        setIsUserFormOpen(true);
    };

    const handleEliminar = (item: Usuario) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmarEliminar = async () => {
        setIsDeleting(true);
        if (itemToDelete) {
            try {
                const deleteUserFunction = httpsCallable('deleteUser');
                await deleteUserFunction({ uid: itemToDelete.id });

                obtenerUsuarios();
                toast.success("Usuario eliminado con éxito");
            } catch (error) {
                console.error(error);
                toast.error("Error al eliminar el usuario");
            } finally {
                setIsDeleting(false);
            }
        }
        setItemToDelete(null);
        setShowDeleteModal(false);
    };

    const handleUserFormClose = () => {
        setIsUserFormOpen(false);
        setEditItem(null);
        obtenerUsuarios();
    };

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <h1 className="text-xl font-semibold mb-4 text-center">Panel de Control de Usuarios</h1>
            <div className="flex flex-col p-4 max-w-4xl mx-auto shadow-inner dark:shadow-slate-300/20 rounded-xl overflow-x-auto">
                <UserForm
                    isOpen={isUserFormOpen}
                    onClose={handleUserFormClose}
                    editItem={editItem}
                    onUpdate={obtenerUsuarios}
                />

                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    aria-label="Opciones"
                    className='pl-1'
                >
                    <Tab key="companias" title="Compañías">
                        <UserTable
                            usuarios={companyUsuarios}
                            onAddNew={() => setIsUserFormOpen(true)}
                            onEdit={handleEditar}
                            onDelete={handleEliminar}
                            onRefresh={obtenerUsuarios}
                        />
                    </Tab>
                    <Tab key="administradores" title="Administradores">
                        <UserTable
                            usuarios={adminUsuarios}
                            onAddNew={() => setIsUserFormOpen(true)}
                            onEdit={handleEditar}
                            onDelete={handleEliminar}
                            onRefresh={obtenerUsuarios}
                        />
                    </Tab>

                </Tabs>

                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    isDeleting={isDeleting}
                    onConfirm={confirmarEliminar}
                    onCancel={() => setShowDeleteModal(false)}
                    title="Eliminar Usuario"
                    content={`¿Estás seguro de que deseas eliminar el usuario "${itemToDelete?.name}"?`}
                />
            </div>
        </div>
    );
}