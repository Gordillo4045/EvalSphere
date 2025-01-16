import React, { useState, useEffect } from 'react'
import { Button, Input, Textarea, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, Chip } from "@heroui/react"
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/config';
import { toast } from 'sonner';
import { Ticket, Reply } from '@/types/tickets';

export default function ClienteTicketSupport({ companyId }: { companyId: string }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

    const addNewTicket = async (title: string, description: string) => {
        try {
            const newTicket: Omit<Ticket, 'id'> = {
                title,
                description,
                status: 'pendiente',
                createdAt: new Date().toISOString().split('T')[0],
                companyId: companyId
            }

            const docRef = await addDoc(collection(db, `companies/${companyId}/support`), newTicket);

            setTickets([...tickets, { ...newTicket, id: docRef.id }]);
            setIsNewTicketOpen(false);
            toast.success('Ticket creado exitosamente');
        } catch (error) {
            console.error('Error al crear ticket:', error);
            toast.error('Error al crear el ticket');
        }
    }

    useEffect(() => {
        const loadTickets = async () => {
            try {
                const ticketsQuery = query(
                    collection(db, `companies/${companyId}/support`)
                );
                const ticketsSnapshot = await getDocs(ticketsQuery);

                const loadedTickets = ticketsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: typeof data.createdAt === 'string'
                            ? data.createdAt
                            : new Date().toISOString().split('T')[0],
                    } as Ticket;
                });

                setTickets(loadedTickets);
            } catch (error) {
                console.error('Error al cargar tickets:', error);
                toast.error('Error al cargar los tickets');
            }
        };

        loadTickets();
    }, [companyId]);

    return (
        <div className="container mx-auto p-4">

            <div className="mb-8">
                <Button size="md" onPress={() => setIsNewTicketOpen(true)} variant='flat' color='secondary'>Crear Nueva Solicitud de Soporte</Button>
                <Modal placement='top-center' isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)}>
                    <ModalContent>
                        <ModalHeader>Nueva Solicitud de Soporte</ModalHeader>
                        <ModalBody>
                            <NewTicketForm onSubmit={addNewTicket} />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                ) : (
                    <p>No hay tickets disponibles</p>
                )}
            </div>
        </div>
    )
}

function NewTicketForm({ onSubmit }: { onSubmit: (title: string, description: string) => void }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(title, description)
        setTitle('')
        setDescription('')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Título de la Solicitud"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant='bordered'
            />
            <Textarea
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant='bordered'
            />
            <Button type="submit" variant='ghost'>Enviar Solicitud</Button>
        </form>
    )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadReplies = async () => {
        setIsLoading(true);
        try {
            const repliesQuery = query(
                collection(db, `companies/${ticket.companyId}/support/${ticket.id}/replies`)
            );
            const repliesSnapshot = await getDocs(repliesQuery);

            const loadedReplies = repliesSnapshot.docs.map(replyDoc => {
                const data = replyDoc.data();
                return {
                    id: replyDoc.id,
                    message: data.message,
                    createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                } as Reply;
            });

            setReplies(loadedReplies);
        } catch (error) {
            console.error('Error al cargar respuestas:', error);
            toast.error('Error al cargar las respuestas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        loadReplies();
    };

    return (
        <>
            <Card className='w-full'>
                <CardHeader className='flex flex-col justify-between items-start'>
                    <h3 className="text-lg font-semibold ">{ticket.title}</h3>
                    <p className="text-small text-default-500">Creado el {ticket.createdAt}</p>
                </CardHeader>
                <CardBody className='p-4'>
                    <p className="mb-4 truncate">{ticket.description}</p>
                    <div className="flex justify-between items-center">
                        <Chip
                            size='sm'
                            color={
                                ticket.status === 'pendiente' ? 'warning' :
                                    ticket.status === 'en-proceso' ? 'primary' : 'success'
                            }>
                            {ticket.status === 'pendiente' ? 'Pendiente' :
                                ticket.status === 'en-proceso' ? 'En Proceso' : 'Resuelto'}
                        </Chip>
                        <Button variant="bordered" size="sm" onPress={handleOpenModal}>Ver Detalles</Button>
                    </div>
                </CardBody>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl" placement='top-center' scrollBehavior='outside'>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        {ticket.title}
                        <span className="text-small text-default-500">Creado el {ticket.createdAt}</span>
                    </ModalHeader>
                    <ModalBody className="py-4">
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2">Descripción:</h4>
                            <p>{ticket.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Respuestas:</h4>
                            {isLoading ? (
                                <p>Cargando respuestas...</p>
                            ) : replies.length > 0 ? (
                                <div className="space-y-4">
                                    {replies.map((reply) => (
                                        <Card key={reply.id} className="w-full">
                                            <CardBody>
                                                <p>{reply.message}</p>
                                                <p className="text-small text-default-500 mt-2">
                                                    {reply.createdAt}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-default-500">No hay respuestas todavía</p>
                            )}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
