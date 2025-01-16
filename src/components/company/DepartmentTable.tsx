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
    ButtonGroup
} from "@heroui/react";
import { IoIosSearch } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { db } from '@/config/config';
import { Department } from '@/types/applicaciontypes';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface DepartmentTableProps {
    companyId: string;
}

const INITIAL_VISIBLE_COLUMNS = ["name", "description", "actions"];

export default function DepartmentTable({ companyId }: DepartmentTableProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    visibleColumns;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
    const [newDepartment, setNewDepartment] = useState<Partial<Department>>({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

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

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = useMemo(() => [
        { uid: "name", name: "Nombre del Departamento" },
        { uid: "description", name: "Descripción" },
        { uid: "actions", name: "Acciones" },
    ], []);

    const filteredItems = useMemo(() => {
        let filteredDepartments = [...departments];

        if (hasSearchFilter) {
            filteredDepartments = filteredDepartments.filter((item) =>
                item.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredDepartments;
    }, [departments, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Department];
            const second = b[sortDescriptor.column as keyof Department];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = (item: Department, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return <span>{item.name}</span>;
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
        setNewDepartment({});
        setCurrentDepartment(null);
        onOpen();
    };

    const onEdit = (item: Department) => {
        setModalMode('edit');
        setNewDepartment({ name: item.name, description: item.description });
        setCurrentDepartment(item);
        onOpen();
    };

    const onDelete = (item: Department) => {
        setDepartmentToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        if (departmentToDelete) {
            try {
                const departmentRef = doc(db, `companies/${companyId}/departments`, departmentToDelete.id);
                await deleteDoc(departmentRef);
                setDeleteModalOpen(false);
                setDepartmentToDelete(null);
            } catch (error) {
                console.error("Error al eliminar departamento: ", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const onRefresh = () => {
        // La actualización en tiempo real ya está implementada con onSnapshot
    };

    const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newDepartment.name) {
            try {
                const departmentData = {
                    ...newDepartment,
                    companyId,
                };

                if (modalMode === 'add') {
                    const departmentsRef = collection(db, `companies/${companyId}/departments`);
                    await addDoc(departmentsRef, departmentData);
                } else if (modalMode === 'edit' && currentDepartment) {
                    const departmentRef = doc(db, `companies/${companyId}/departments`, currentDepartment.id);
                    await updateDoc(departmentRef, departmentData);
                }
                onClose();
                setNewDepartment({});
            } catch (error) {
                console.error("Error al guardar departamento: ", error);
            }
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
                        placeholder="Buscar por nombre de departamento"
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
                    total={departments.length > 0 ? Math.ceil(filteredItems.length / rowsPerPage) : 1}
                    variant="light"
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {`${filteredItems.length} departamentos`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    return (
        <>
            <Table
                aria-label="Tabla de Departamentos"
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
                <TableBody items={items} emptyContent={"No se encontraron departamentos"}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='outside'>
                <ModalContent>
                    <ModalHeader>{modalMode === 'add' ? 'Agregar Departamento' : 'Editar Departamento'}</ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
                            <Input
                                autoFocus
                                label="Nombre del Departamento"
                                variant='underlined'
                                value={newDepartment.name || ''}
                                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                            />
                            <Input
                                label="Descripción (opcional)"
                                variant='underlined'
                                value={newDepartment.description || ''}
                                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
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
                isDeleting={isDeleting}
                isOpen={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Departamento"
                content={`¿Estás seguro de que deseas eliminar el departamento "${departmentToDelete?.name}"?`}
            />
        </>
    );
}