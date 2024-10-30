import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from 'sonner';
import { db, httpsCallable } from '@/config/config';
import { Tabs, Tab } from "@nextui-org/react";

import UserForm from '@/components/UserForm';
import UserTable from '@/components/UsersTable';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TicketsTable from '@/components/TicketsTable';
interface Usuario {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    puestoTrabajo?: string;
    avatar?: string;
}

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'pendiente' | 'en-proceso' | 'resuelto';
    createdAt: string;
    companyId: string;
}

interface Reply {
    id: string;
    message: string;
    createdAt: any;
    createdBy: string;
    isAdminReply: boolean;
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
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [companyNames, setCompanyNames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        getUsers();
        getTickets();
    }, []);

    const getUsers = async () => {
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

    const getTickets = async () => {
        try {
            const companiasSnapshot = await getDocs(collection(db, "companies"));
            let allTickets: (Ticket & { companyId: string; replies: Reply[] })[] = [];
            const companyNames: { [key: string]: string } = {};

            await Promise.all(companiasSnapshot.docs.map(async (companyDoc) => {

                companyNames[companyDoc.id] = companyDoc.data().name;

                const ticketsSnapshot = await getDocs(collection(db, `companies/${companyDoc.id}/support`));

                const ticketsPromises = ticketsSnapshot.docs.map(async (ticketDoc) => {
                    const repliesSnapshot = await getDocs(
                        collection(db, `companies/${companyDoc.id}/support/${ticketDoc.id}/replies`)
                    );

                    const replies = repliesSnapshot.docs.map(replyDoc => ({
                        id: replyDoc.id,
                        ...replyDoc.data()
                    })) as Reply[];

                    return {
                        id: ticketDoc.id,
                        ...ticketDoc.data(),
                        companyId: companyDoc.id,
                        replies
                    } as Ticket & { companyId: string; replies: Reply[] };
                });

                const ticketsCompania = await Promise.all(ticketsPromises);
                allTickets = [...allTickets, ...ticketsCompania];
            }));

            allTickets.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setTickets(allTickets);
            setCompanyNames(companyNames);
        } catch (error) {
            console.error('Error al obtener tickets:', error);
            toast.error('Error al cargar los tickets de soporte');
        }
    };

    const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status'], companyId: string) => {
        try {
            const ticketRef = doc(db, `companies/${companyId}/support`, ticketId);
            await updateDoc(ticketRef, {
                status: newStatus
            });
            await getTickets();
            toast.success('Estado del ticket actualizado');
        } catch (error) {
            console.error('Error al actualizar ticket:', error);
            toast.error('Error al actualizar el estado del ticket');
        }
    };

    const handleEdit = async (item: Usuario) => {
        setEditItem(item);
        setIsUserFormOpen(true);
    };

    const handleDelete = (item: Usuario) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        if (itemToDelete) {
            try {
                const deleteUserFunction = httpsCallable('deleteUser');
                await deleteUserFunction({ uid: itemToDelete.id });

                getUsers();
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
        getUsers();
    };

    const handleTicketReply = async (ticketId: string, message: string, companyId: string) => {
        try {
            const replyRef = collection(db, `companies/${companyId}/support/${ticketId}/replies`);

            await addDoc(replyRef, {
                message,
                createdAt: serverTimestamp(),
                createdBy: 'admin',
                isAdminReply: true
            });

            getTickets();

            toast.success('Respuesta enviada correctamente');
        } catch (error) {
            console.error('Error al enviar la respuesta:', error);
            toast.error('Error al enviar la respuesta');
        }
    };

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <h1 className="text-xl font-semibold mb-4 text-center">Panel de Control de Usuarios</h1>
            <div className="flex flex-col p-4 max-w-4xl mx-auto shadow-inner dark:shadow-slate-300/20 rounded-xl overflow-x-auto">
                <UserForm
                    isOpen={isUserFormOpen}
                    onClose={handleUserFormClose}
                    editItem={editItem}
                    onUpdate={getUsers}
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
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRefresh={getUsers}
                        />
                    </Tab>
                    <Tab key="administradores" title="Administradores">
                        <UserTable
                            usuarios={adminUsuarios}
                            onAddNew={() => setIsUserFormOpen(true)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRefresh={getUsers}
                        />
                    </Tab>
                    <Tab key="soporte" title="Tickets de Soporte">
                        <TicketsTable
                            companyNames={companyNames}
                            tickets={tickets}
                            onStatusChange={updateTicketStatus}
                            onRefresh={getTickets}
                            onReply={handleTicketReply}
                        />
                    </Tab>
                </Tabs>

                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    title="Eliminar Usuario"
                    content={`¿Estás seguro de que deseas eliminar el usuario "${itemToDelete?.name}"?`}
                />
            </div>
        </div>
    );
}