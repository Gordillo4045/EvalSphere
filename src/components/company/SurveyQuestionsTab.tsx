import { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tooltip,
    Select,
    SelectItem
} from "@nextui-org/react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../config/config';
import { toast } from 'sonner';
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";
import { FaPlus } from 'react-icons/fa6';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface SurveyQuestion {
    id: string;
    question: string;
    category: string;
}

interface SurveyQuestionsTabProps {
    companyId: string;
}

const CATEGORIES = [
    "Organización",
    "Liderazgo",
    "Comunicación",
    "Responsabilidad",
    "Aprendizaje",
    "Adaptación"
];

export default function SurveyQuestionsTab({ companyId }: SurveyQuestionsTabProps) {
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState({ question: '', category: '' });
    const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<SurveyQuestion | null>(null);

    useEffect(() => {
        const questionsRef = collection(db, `companies/${companyId}/surveyQuestions`);
        const q = query(questionsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const questionsData: SurveyQuestion[] = [];
            querySnapshot.forEach((doc) => {
                questionsData.push({ id: doc.id, ...doc.data() } as SurveyQuestion);
            });
            setQuestions(questionsData);
        });

        return () => unsubscribe();
    }, [companyId]);

    const handleAddQuestion = async () => {
        if (!newQuestion.question || !newQuestion.category) {
            toast.error("Por favor, complete todos los campos.");
            return;
        }

        try {
            const questionsRef = collection(db, `companies/${companyId}/surveyQuestions`);
            await addDoc(questionsRef, newQuestion);
            setNewQuestion({ question: '', category: '' });
            toast.success("Pregunta agregada exitosamente.");
        } catch (error) {
            console.error("Error al agregar pregunta:", error);
            toast.error("Error al agregar pregunta.");
        }
    };

    const handleEditQuestion = async () => {
        if (!editingQuestion || !editingQuestion.question || !editingQuestion.category) {
            toast.error("Por favor, complete todos los campos.");
            return;
        }

        try {
            const questionRef = doc(db, `companies/${companyId}/surveyQuestions`, editingQuestion.id);
            await updateDoc(questionRef, {
                question: editingQuestion.question,
                category: editingQuestion.category
            });
            setEditingQuestion(null);
            onClose();
            toast.success("Pregunta actualizada exitosamente.");
        } catch (error) {
            console.error("Error al actualizar pregunta:", error);
            toast.error("Error al actualizar pregunta.");
        }
    };

    const handleDeleteQuestion = async (question: SurveyQuestion) => {
        setQuestionToDelete(question);
        setDeleteModalOpen(true);
    };

    const confirmDeleteQuestion = async () => {
        if (questionToDelete) {
            try {
                await deleteDoc(doc(db, `companies/${companyId}/surveyQuestions`, questionToDelete.id));
                setDeleteModalOpen(false);
                setQuestionToDelete(null);
                toast.success("Pregunta eliminada exitosamente.");
            } catch (error) {
                console.error("Error al eliminar pregunta:", error);
                toast.error("Error al eliminar pregunta.");
            }
        }
    };

    return (
        <div>
            <div className="flex gap-4 mb-4">
                <Input
                    autoFocus
                    placeholder="Nueva pregunta"
                    aria-label="Nueva pregunta"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                />
                <Select
                    placeholder="Categoría"
                    aria-label="Categoría"
                    selectedKeys={newQuestion.category ? [newQuestion.category] : []}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className='w-60'
                >
                    {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                            {category}
                        </SelectItem>
                    ))}
                </Select>
                <Button color="primary" className='w-36' onPress={handleAddQuestion} endContent={<FaPlus />} >Agregar </Button>
            </div>

            <Table aria-label="Tabla de Preguntas de Encuesta" >
                <TableHeader>
                    <TableColumn>Categoría</TableColumn>
                    <TableColumn>Pregunta</TableColumn>
                    <TableColumn>Acciones</TableColumn>
                </TableHeader>
                <TableBody>
                    {CATEGORIES.map((category) => {
                        const categoryQuestions = questions.filter(q => q.category === category);
                        return categoryQuestions.length > 0 ? (
                            <TableRow key={category} aria-label={category}>
                                <TableCell width="200px" >{category}</TableCell>
                                <TableCell>
                                    {categoryQuestions.map((question, index) => (
                                        <div key={question.id} className={index < categoryQuestions.length - 1 ? "mb-5" : ""}>
                                            {question.question}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell width="100px">
                                    {categoryQuestions.map((question) => (
                                        <div key={question.id} className="flex gap-2 mb-2">
                                            <Tooltip content="Editar">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => {
                                                        setEditingQuestion(question);
                                                        onOpen();
                                                    }}
                                                >
                                                    <AiOutlineEdit size={20} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Eliminar" color="danger">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    onPress={() => handleDeleteQuestion(question)}
                                                >
                                                    <BiSolidTrashAlt size={20} />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ) : null;
                    })}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Editar Pregunta</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Pregunta"
                            value={editingQuestion?.question || ''}
                            onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                        />
                        <Select
                            label="Categoría"
                            selectedKeys={editingQuestion?.category ? [editingQuestion.category] : []}
                            onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, category: e.target.value } : null)}
                        >
                            {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleEditQuestion}>
                            Guardar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteQuestion}
                title="Eliminar Pregunta"
                content={`¿Estás seguro de que deseas eliminar la pregunta "${questionToDelete?.question}"?`}
            />
        </div>
    );
}
