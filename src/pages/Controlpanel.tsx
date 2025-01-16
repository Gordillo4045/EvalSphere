import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from 'sonner';
import { db, httpsCallable } from '@/config/config';
import { Tabs, Tab } from "@heroui/react";

import UserForm from '@/components/UserForm';
import UserTable from '@/components/UsersTable';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TicketsTable from '@/components/TicketsTable';
import { Ticket, Reply } from '@/types/tickets';
import BlurIn from "@/components/ui/blur-in";

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
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [companyNames, setCompanyNames] = useState<{ [key: string]: string }>({});
    const [employeeTickets, setEmployeeTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        getUsers();
        getTickets();
        getEmployeeTickets();
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

    const getEmployeeTickets = async () => {
        try {
            const employeesSnapshot = await getDocs(collection(db, 'employees'));

            const allTicketsPromises = employeesSnapshot.docs.map(async (employeeDoc) => {
                const employeeId = employeeDoc.id;

                const ticketsSnapshot = await getDocs(
                    collection(db, `employees/${employeeId}/support`)
                );

                const employeeTickets = await Promise.all(
                    ticketsSnapshot.docs.map(async (ticketDoc) => {
                        const repliesSnapshot = await getDocs(
                            collection(db, `employees/${employeeId}/support/${ticketDoc.id}/replies`)
                        );

                        const replies = repliesSnapshot.docs.map(replyDoc => ({
                            id: replyDoc.id,
                            ...replyDoc.data()
                        })) as Reply[];

                        return {
                            id: ticketDoc.id,
                            employeeId,
                            ...ticketDoc.data(),
                            replies,
                            type: 'employee'
                        } as Ticket & { replies: Reply[] };
                    })
                );

                return employeeTickets;
            });

            const allTickets = (await Promise.all(allTicketsPromises)).flat();

            setEmployeeTickets(allTickets);

        } catch (error) {
            console.error('Error al obtener tickets de empleados:', error);
        }
    };

    const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status'], type: 'company' | 'employee', companyId?: string, employeeId?: string) => {
        try {
            let ticketRef;

            if (type === 'company') {
                ticketRef = doc(db, `companies/${companyId}/support`, ticketId);
            } else {
                ticketRef = doc(db, `employees/${employeeId}/support`, ticketId);
            }

            await updateDoc(ticketRef, {
                status: newStatus
            });

            if (type === 'company') {
                await getTickets();
            } else {
                await getEmployeeTickets();
            }

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

    const handleTicketReply = async (ticketId: string, message: string, type: 'company' | 'employee', companyId?: string, employeeId?: string) => {
        try {
            let replyRef;

            if (type === 'company') {
                replyRef = collection(db, `companies/${companyId}/support/${ticketId}/replies`);
            } else {
                replyRef = collection(db, `employees/${employeeId}/support/${ticketId}/replies`);
            }

            await addDoc(replyRef, {
                message,
                createdAt: serverTimestamp(),
                createdBy: 'admin',
                isAdminReply: true
            });

            if (type === 'company') {
                await getTickets();
            } else {
                await getEmployeeTickets();
            }

            toast.success('Respuesta enviada correctamente');
        } catch (error) {
            console.error('Error al enviar la respuesta:', error);
            toast.error('Error al enviar la respuesta');
        }
    };

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <div className="flex justify-center my-3">
                <div className="flex items-end justify-between">
                    <BlurIn word={`Panel de Control`} className="text-lg md:text-xl font-semibold text-center flex-grow" />
                    <span className="pl-1 text-default-400 text-sm">Admin</span>
                </div>
            </div>
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
                    <Tab key="companias" title="Compañías" aria-label="Compañías">
                        <UserTable
                            usuarios={companyUsuarios}
                            onAddNew={() => setIsUserFormOpen(true)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRefresh={getUsers}
                        />
                    </Tab>
                    <Tab key="administradores" title="Administradores" aria-label="Administradores">
                        <UserTable
                            usuarios={adminUsuarios}
                            onAddNew={() => setIsUserFormOpen(true)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRefresh={getUsers}
                        />
                    </Tab>
                    <Tab key="soporte" title="Tickets de Soporte Empresas" aria-label="Tickets de Soporte Empresas">
                        <TicketsTable
                            companyNames={companyNames}
                            tickets={tickets}
                            onStatusChange={(id, status, companyId) =>
                                updateTicketStatus(id, status, 'company', companyId)}
                            onRefresh={getTickets}
                            onReply={(id, message, companyId) =>
                                handleTicketReply(id, message, 'company', companyId)}
                            isEmployeeTickets={false}
                        />
                    </Tab>
                    <Tab key="soporteEmpleados" title="Tickets de Soporte Empleados" aria-label="Tickets de Soporte Empleados">
                        <TicketsTable
                            companyNames={companyNames}
                            tickets={employeeTickets}
                            onStatusChange={(id, status, _, employeeId) =>
                                updateTicketStatus(id, status, 'employee', undefined, employeeId)}
                            onRefresh={getEmployeeTickets}
                            onReply={(id, message, _, employeeId) =>
                                handleTicketReply(id, message, 'employee', undefined, employeeId)}
                            isEmployeeTickets={true}
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