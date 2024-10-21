import React, { useState } from 'react'
import { Button, Input, Textarea, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, Chip } from "@nextui-org/react"

type Ticket = {
    id: string
    title: string
    description: string
    status: 'pendiente' | 'en-proceso' | 'resuelto'
    createdAt: string
}

const initialTickets: Ticket[] = [
    { id: '1', title: 'Problema con mi pedido', description: 'No he recibido mi pedido y ya pasaron 5 días', status: 'pendiente', createdAt: '2023-05-01' },
    { id: '2', title: 'Duda sobre el producto', description: '¿El producto es compatible con...?', status: 'resuelto', createdAt: '2023-04-28' },
    { id: '3', title: 'Solicitud de reembolso', description: 'Quiero solicitar un reembolso por...', status: 'en-proceso', createdAt: '2023-05-02' },
]

export default function ClienteTicketSupport() {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

    const addNewTicket = (title: string, description: string) => {
        const newTicket: Ticket = {
            id: (tickets.length + 1).toString(),
            title,
            description,
            status: 'pendiente',
            createdAt: new Date().toISOString().split('T')[0],
        }
        setTickets([...tickets, newTicket])
        setIsNewTicketOpen(false)
    }

    return (
        <div className="container mx-auto p-4">

            <div className="mb-8">
                <Button size="md" onPress={() => setIsNewTicketOpen(true)} variant='faded'>Crear Nueva Solicitud de Soporte</Button>
                <Modal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)}>
                    <ModalContent>
                        <ModalHeader>Nueva Solicitud de Soporte</ModalHeader>
                        <ModalBody>
                            <NewTicketForm onSubmit={addNewTicket} />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                ))}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Textarea
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <Button type="submit">Enviar Solicitud</Button>
        </form>
    )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
    return (
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
                    <Button variant="bordered" size="sm">Ver Detalles</Button>
                </div>
            </CardBody>
        </Card>
    )
}
