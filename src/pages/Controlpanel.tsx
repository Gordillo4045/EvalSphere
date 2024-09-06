import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from 'sonner';
import { db, httpsCallable } from '../config/config';

import UserForm from '../components/UserForm';
import UserTable from '../components/UsersTable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Company } from '../types/applicaciontypes';

interface Usuario {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    puestoTrabajo?: string;
    avatar?: string;
}

type Item = Usuario | Company;

export default function Controlpanel() {
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Usuario | Company | null>(null);
    const [editItem, setEditItem] = useState<Usuario | Company | null>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        obtenerUsuariosYCompanias();
    }, []);

    const obtenerUsuariosYCompanias = async () => {
        try {
            const usuariosCollection = collection(db, "usuarios");
            const companiasCollection = collection(db, "companies");
            const [usuariosSnapshot, companiasSnapshot] = await Promise.all([
                getDocs(usuariosCollection),
                getDocs(companiasCollection)
            ]);

            const usuariosData: Usuario[] = [];
            usuariosSnapshot.forEach((doc) => {
                const usuario = { id: doc.id, ...doc.data() } as Usuario;
                usuariosData.push(usuario);
            });

            const companiasData: Company[] = [];
            companiasSnapshot.forEach((doc) => {
                const compania = { id: doc.id, ...doc.data() } as Company;
                companiasData.push(compania);
            });

            setUsuarios(usuariosData);
            setCompanies(companiasData);
        } catch (error) {
            console.error("Error al obtener usuarios y compañías:", error);
            toast.error("Error al obtener la lista de usuarios y compañías");
        }
    };

    const handleEditar = async (item: Item) => {
        setEditItem(item);
        setIsUserFormOpen(true);
    };

    const handleEliminar = (item: Item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmarEliminar = async () => {
        if (itemToDelete) {
            try {
                if ('role' in itemToDelete) {
                    const deleteUserFunction = httpsCallable('deleteUser');
                    await deleteUserFunction({ uid: itemToDelete.id });
                } else {
                    const deleteCompanyFunction = httpsCallable('deleteCompany');
                    await deleteCompanyFunction({ id: itemToDelete.id });
                }

                obtenerUsuariosYCompanias();
                toast.success("Elemento eliminado con éxito");
            } catch (error) {
                console.error(error);
                toast.error("Error al eliminar el elemento");
            }
        }
        setItemToDelete(null);
        setShowDeleteModal(false);
    };

    const handleUserFormClose = () => {
        setIsUserFormOpen(false);
        setEditItem(null);
        obtenerUsuariosYCompanias();
    };

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <h1 className="text-xl font-semibold mb-4 text-center">Panel de Control de Usuarios y Compañías</h1>
            <div className="flex flex-col p-4 max-w-4xl mx-auto shadow-inner rounded-xl overflow-x-auto">
                <UserForm
                    isOpen={isUserFormOpen}
                    onClose={handleUserFormClose}
                    editItem={editItem}
                    onUpdate={obtenerUsuariosYCompanias}
                />

                <UserTable
                    usuarios={usuarios}
                    companies={companies}
                    onAddNew={() => setIsUserFormOpen(true)}
                    onEdit={handleEditar}
                    onDelete={handleEliminar}
                    onRefresh={obtenerUsuariosYCompanias}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onConfirm={confirmarEliminar}
                    onCancel={() => setShowDeleteModal(false)}
                />
            </div>
        </div>
    );
}