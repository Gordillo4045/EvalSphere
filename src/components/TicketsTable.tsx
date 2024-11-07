import { useState, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Pagination,
    SortDescriptor,
    Tooltip,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    Chip,
    ScrollShadow,
} from "@nextui-org/react";
import { IoIosEye, IoIosSearch } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { Ticket } from '@/types/tickets';

interface TicketsTableProps {
    companyNames?: { [key: string]: string };
    tickets: Ticket[];
    onStatusChange: (id: string, status: Ticket['status'], companyId?: string, employeeId?: string) => void;
    onRefresh: () => void;
    onReply: (id: string, message: string, companyId?: string, employeeId?: string) => void;
    isEmployeeTickets?: boolean;
}

const INITIAL_VISIBLE_COLUMNS = ["companyId", "ticket", "status", "date", "actions"];

export default function TicketsTable({
    companyNames,
    tickets,
    onStatusChange,
    onRefresh,
    onReply,
    isEmployeeTickets = false
}: TicketsTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    visibleColumns;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "date",
        direction: "descending",
    });
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = useMemo(() => [
        {
            uid: "companyId",
            name: isEmployeeTickets ? "Empleado" : "Compañía"
        },
        { uid: "ticket", name: "Ticket" },
        { uid: "status", name: "Estado" },
        { uid: "date", name: "Fecha" },
        { uid: "actions", name: "Acciones" },
    ], [isEmployeeTickets]);

    const filteredItems = useMemo(() => {
        let filteredTickets = [...tickets];

        if (hasSearchFilter) {
            filteredTickets = filteredTickets.filter((item) => {
                return (
                    item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
                    item.description.toLowerCase().includes(filterValue.toLowerCase()) ||
                    item.id.toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        if (statusFilter !== "all") {
            filteredTickets = filteredTickets.filter((item) => item.status === statusFilter);
        }

        return filteredTickets;
    }, [tickets, filterValue, statusFilter]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Ticket] || '';
            const second = b[sortDescriptor.column as keyof Ticket] || '';
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const statusOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en-proceso', label: 'En Proceso' },
        { value: 'resuelto', label: 'Resuelto' },
    ];

    const renderCell = (item: Ticket, columnKey: React.Key) => {
        switch (columnKey) {
            case "companyId":
                if (isEmployeeTickets) {
                    return (
                        <div>
                            <p className="font-medium">{item.employeeName}</p>
                        </div>
                    );
                }
                return <span>{companyNames?.[item.companyId || ''] || 'Desconocido'}</span>;

            case "ticket":
                return (
                    <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-small text-default-400 truncate">
                            {item.description.split(' ').slice(0, 5).join(' ')}
                        </p>
                    </div>
                );
            case "status":
                return (
                    <Chip size="sm" color={item.status === 'pendiente' ? 'danger' : item.status === 'en-proceso' ? 'warning' : 'success'}>{item.status === 'pendiente' ? 'Pendiente' : item.status === 'en-proceso' ? 'En Proceso' : 'Resuelto'}</Chip>
                );
            case "date":
                return <span>{new Date(item.createdAt).toLocaleDateString()}</span>;
            case "actions":
                return (
                    <div className="flex gap-3">
                        <Button
                            variant="light"
                            onPress={() => {
                                setSelectedTicket(item);
                                setIsModalOpen(true);
                            }}
                            startContent={<IoIosEye />}
                        >
                            Detalles
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const onSearchChange = (value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Buscar por título o ID"
                        size="sm"
                        startContent={<IoIosSearch className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                        aria-label="Buscar por título o ID"
                    />
                    <div className="flex gap-3 items-center">
                        <Tooltip content="Actualizar">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={onRefresh}
                            >
                                <IoReload size={20} />
                            </Button>
                        </Tooltip>
                        <Select
                            size="sm"
                            className="w-[150px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            defaultSelectedKeys={['all']}
                            aria-label="Filtrar por estado"
                        >
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onRefresh, statusFilter]);

    const bottomContent = useMemo(() => {
        return (
            <div className="md:py-2 md:px-2 flex justify-between items-center">
                <Pagination
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    page={page}
                    total={Math.max(1, Math.ceil(filteredItems.length / rowsPerPage))}
                    variant="light"
                    onChange={setPage}
                    aria-label="Paginación"
                />
                <span className="text-small text-default-400">
                    {`${filteredItems.length} tickets`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    const handleReply = () => {
        if (selectedTicket && replyMessage) {
            if (isEmployeeTickets) {
                onReply(selectedTicket.id, replyMessage, undefined, selectedTicket.employeeId);
            } else {
                onReply(selectedTicket.id, replyMessage, selectedTicket.companyId);
            }
            setReplyMessage('');
            setIsModalOpen(false);
        }
    };

    const renderModal = () => (
        <Modal
            isOpen={isModalOpen}
            onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) {
                    setReplyMessage("");
                    setSelectedTicket(null);
                }
            }}
            size="2xl"
            placement="top-center"
            scrollBehavior="outside"
            aria-label="Modal de Detalles del Ticket"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-row gap-1 justify-between">
                            Detalles del Ticket
                            <div className='flex flex-row gap-3 items-center'>
                                <p className="text-sm text-default-500">ID</p>
                                <p className='text-xs'>{selectedTicket?.id}</p>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            {selectedTicket && (
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3">
                                            <p className="text-sm text-default-500">Título</p>
                                            <p>{selectedTicket.title}</p>

                                            <p className="text-sm text-default-500 mt-2">Descripción</p>
                                            <ScrollShadow className="max-h-[150px]">
                                                <div style={{
                                                    maxHeight: '150px',
                                                    position: 'relative'
                                                }}>
                                                    <p style={{
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {selectedTicket.description}
                                                    </p>
                                                </div>
                                            </ScrollShadow>
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-1 items-end">
                                            {isEmployeeTickets && (
                                                <>
                                                    <p className="text-sm text-default-500">Empleado</p>
                                                    <p className=''>{selectedTicket.employeeName}</p>
                                                </>
                                            )}
                                            <p className="text-sm text-default-500">Compañía</p>
                                            <p className=''>{companyNames?.[selectedTicket.companyId || ''] || 'Desconocido'}</p>
                                            <p className="text-sm text-default-500">Fecha</p>
                                            <p className='text-xs'>{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-default-500">Estado</p>
                                        <Select
                                            autoFocus
                                            className="max-w-xs"
                                            value={selectedTicket.status}
                                            onChange={(e) => {
                                                if (isEmployeeTickets) {
                                                    onStatusChange(
                                                        selectedTicket.id,
                                                        e.target.value as Ticket['status'],
                                                        undefined,
                                                        selectedTicket.employeeId
                                                    );
                                                } else {
                                                    onStatusChange(
                                                        selectedTicket.id,
                                                        e.target.value as Ticket['status'],
                                                        selectedTicket.companyId
                                                    );
                                                }
                                            }}
                                            defaultSelectedKeys={[selectedTicket.status]}
                                            variant="bordered"
                                            aria-label="Filtrar por estado"
                                        >
                                            {statusOptions.slice(1).map((option) => (
                                                <SelectItem aria-label={option.label} key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                                        <div className="border rounded-lg p-4">
                                            <p className="text-sm text-default-500 mb-2">Respuestas anteriores</p>
                                            <div className="flex flex-col gap-3">
                                                {selectedTicket.replies.map((reply) => (
                                                    <div
                                                        key={reply.id}
                                                        className={`p-3 rounded-lg ${reply.isAdminReply
                                                            ? 'bg-primary-50 ml-4'
                                                            : 'bg-default-50 mr-4'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{reply.message}</p>
                                                        <p className="text-xs text-default-400 mt-1">
                                                            {new Date(reply.createdAt?.toDate()).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-default-500">Nueva Respuesta</p>
                                        <Textarea
                                            aria-label="Nueva Respuesta"
                                            placeholder="Escribe tu respuesta aquí..."
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            minRows={3}
                                            variant="bordered"
                                        />
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleReply}
                                isDisabled={!replyMessage.trim()}
                                aria-label="Enviar Respuesta"
                            >
                                Enviar Respuesta
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
    return (
        <>
            <Table
                aria-label={isEmployeeTickets ? "Tabla de tickets de empleados" : "Tabla de tickets de empresas"}
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[582px]",
                }}
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={"start"}
                            allowsSorting={column.uid !== "actions"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items} emptyContent={"No se encontraron tickets"}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {renderModal()}
        </>
    );
} 