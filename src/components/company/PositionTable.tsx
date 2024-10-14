import React, { useState, useMemo, useEffect } from 'react';
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
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
    ButtonGroup
} from "@nextui-org/react";
import { IoIosSearch } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc, collectionGroup } from 'firebase/firestore';
import { db } from '@/config/config';
import { Position, Department } from '@/types/applicaciontypes';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { toast } from 'sonner';

interface PositionTableProps {
    companyId: string;
}

const INITIAL_VISIBLE_COLUMNS = ["title", "department", "level", "description", "actions"];

export default function PositionTable({ companyId }: PositionTableProps) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    visibleColumns;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "title",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [newPosition, setNewPosition] = useState<Partial<Position>>({});

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

    useEffect(() => {
        const positionsQuery = query(collectionGroup(db, 'positions'));

        const unsubscribe = onSnapshot(positionsQuery, (querySnapshot) => {
            const positionsData: Position[] = [];
            querySnapshot.forEach((doc) => {
                const position = { id: doc.id, ...doc.data() } as Position;
                if (position.companyId === companyId) {
                    positionsData.push(position);
                }
            });
            setPositions(positionsData);
        });

        return () => unsubscribe();
    }, [companyId]);

    useEffect(() => {
        const departmentsRef = collection(db, `companies/${companyId}/departments`);
        const q = query(departmentsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const departmentsData: Department[] = [];
            querySnapshot.forEach((doc) => {
                departmentsData.push({ id: doc.id, ...doc.data() } as Department);
            });
            setDepartments(departmentsData);
        });

        return () => unsubscribe();
    }, [companyId]);

    const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPosition.title && newPosition.department && newPosition.level) {
            try {
                const positionData = {
                    ...newPosition,
                    companyId,
                };

                if (modalMode === 'add') {
                    const positionsRef = collection(db, `companies/${companyId}/departments/${newPosition.department}/positions`);
                    await addDoc(positionsRef, positionData);
                } else if (modalMode === 'edit' && currentPosition) {
                    const positionRef = doc(db, `companies/${companyId}/departments/${currentPosition.department}/positions`, currentPosition.id);
                    await updateDoc(positionRef, positionData);
                }
                onClose();
                setNewPosition({});
            } catch (error) {
                console.error("Error al guardar posición: ", error);
            }
        }
    };

    const onDelete = (item: Position) => {
        setPositionToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (positionToDelete) {
            try {
                const positionRef = doc(db, `companies/${companyId}/departments/${positionToDelete.department}/positions`, positionToDelete.id);
                await deleteDoc(positionRef);
                setDeleteModalOpen(false);
                setPositionToDelete(null);
                toast.success("Posición eliminada correctamente");
            } catch (error) {
                console.error("Error al eliminar posición: ", error);
            }
        }
    };

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = useMemo(() => [
        { uid: "title", name: "Título" },
        { uid: "department", name: "Departamento" },
        { uid: "level", name: "Nivel" },
        { uid: "description", name: "Descripción" },
        { uid: "actions", name: "Acciones" },
    ], []);

    const filteredItems = useMemo(() => {
        let filteredPositions = [...positions];

        if (hasSearchFilter) {
            filteredPositions = filteredPositions.filter((item) =>
                item.title?.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.department?.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.description?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredPositions;
    }, [positions, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Position];
            const second = b[sortDescriptor.column as keyof Position];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = (item: Position, columnKey: React.Key) => {
        switch (columnKey) {
            case "title":
                return <span>{item.title}</span>;
            case "department":
                return <span>{departments.find(d => d.id === item.department)?.name || 'Desconocido'}</span>;
            case "level":
                return <span>{item.level}</span>;
            case "description":
                return <span>{item.description || 'Sin descripción'}</span>;
            case "actions":
                return (
                    <div className="flex justify-start gap-2">
                        <Tooltip content="Editar">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => onEdit(item)}
                            >
                                <AiOutlineEdit size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar" color='danger'>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => onDelete(item)}
                            >
                                <BiSolidTrashAlt size={20} />
                            </Button>
                        </Tooltip>
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

    const onAddNew = () => {
        setModalMode('add');
        setNewPosition({});
        setCurrentPosition(null);
        onOpen();
    };

    const onEdit = (item: Position) => {
        setModalMode('edit');
        setNewPosition({ ...item });
        setCurrentPosition(item);
        onOpen();
    };

    const onRefresh = () => {

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
                        placeholder="Buscar por título, departamento o descripción"
                        size="sm"
                        startContent={<IoIosSearch className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
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
                        <Button
                            size="sm"
                            color="primary"
                            endContent={<FaPlus />}
                            onPress={onAddNew}
                        >
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onRefresh]);

    const bottomContent = useMemo(() => {
        return (
            <div className="md:py-2 md:px-2 flex justify-between items-center">
                <Pagination
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    page={page}
                    total={positions.length > 0 ? Math.ceil(filteredItems.length / rowsPerPage) : 1}
                    variant="light"
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {`${filteredItems.length} posiciones`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    return (
        <>
            <Table
                aria-label="Tabla de Posiciones"
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
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.uid !== "actions"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items} emptyContent={"No se encontraron posiciones"}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='outside'>
                <ModalContent>
                    <ModalHeader>{modalMode === 'add' ? 'Agregar Posición' : 'Editar Posición'}</ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
                            <Input
                                label="Título de la Posición"
                                autoFocus
                                variant='underlined'
                                value={newPosition.title || ''}
                                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                            />
                            <Select
                                label="Departamento"
                                variant='underlined'
                                selectedKeys={newPosition.department ? [newPosition.department] : []}
                                onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                            >
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Input
                                label="Nivel"
                                type="number"
                                variant='underlined'
                                value={newPosition.level?.toString() || ''}
                                onChange={(e) => setNewPosition({ ...newPosition, level: parseInt(e.target.value, 10) })}
                                min={1}
                                max={10}
                                description="Nivel de la posición en la jerarquía (1 más bajo - 10 más alto)"
                            />
                            <Input
                                label="Descripción (opcional)"
                                variant='underlined'
                                value={newPosition.description || ''}
                                onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                            />
                            <ModalFooter>
                                <ButtonGroup>
                                    <Button color="primary" type="submit">
                                        {modalMode === 'add' ? 'Agregar' : 'Guardar'}
                                    </Button>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancelar
                                    </Button>
                                </ButtonGroup>
                            </ModalFooter>
                        </form>
                    </ModalBody>

                </ModalContent>
            </Modal>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Posición"
                content={`¿Estás seguro de que deseas eliminar la posición "${positionToDelete?.title}"?`}
            />
        </>
    );
}