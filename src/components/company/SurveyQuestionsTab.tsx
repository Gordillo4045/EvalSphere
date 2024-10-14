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
import { db } from '@/config/config';
import { toast } from 'sonner';
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";
import { FaPlus } from 'react-icons/fa6';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { FaClipboardList } from 'react-icons/fa';

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

const BASE_QUESTIONS = [
    { category: "Organización", question: "¿Trabaja de forma ordenada?" },
    { category: "Organización", question: "¿Cumple con los plazos de entrega?" },
    { category: "Organización", question: "¿Es capaz de priorizar tareas y manejar su tiempo de manera efectiva?" },
    { category: "Creatividad", question: "¿Propone ideas creativas y de valor?" },
    { category: "Creatividad", question: "¿Busca soluciones innovadoras para los problemas que enfrenta?" },
    { category: "Liderazgo", question: "¿Muestra iniciativa y participa activamente en las reuniones?" },
    { category: "Liderazgo", question: "¿Muestra seguridad en su trabajo?" },
    { category: "Liderazgo", question: "¿Es capaz de tomar decisiones efectivas en momentos críticos?" },
    { category: "Comunicación", question: "¿Se comunica de forma clara y eficaz?" },
    { category: "Comunicación", question: "¿Sabe escuchar?" },
    { category: "Comunicación", question: "¿Muestra una actitud receptiva frente a las opiniones de los demás?" },
    { category: "Responsabilidad", question: "¿Cumple con los plazos de entrega?" },
    { category: "Responsabilidad", question: "¿Su trabajo contribuye a que la empresa alcance sus objetivos?" },
    { category: "Responsabilidad", question: "¿Asume la responsabilidad por sus errores y trabaja para corregirlos?" },
    { category: "Aprendizaje", question: "¿Acepta las críticas y aplica los consejos de los demás en su manera de trabajar?" },
    { category: "Aprendizaje", question: "¿Muestra disposición para aprender y mejorar continuamente?" },
    { category: "Aprendizaje", question: "¿Busca activamente oportunidades para desarrollar nuevas habilidades?" },
    { category: "Adaptación", question: "¿Sabe actuar de manera adecuada ante situaciones de estrés o conflictivas?" },
    { category: "Adaptación", question: "¿Se adapta fácilmente a cambios en su entorno laboral?" },
    { category: "Adaptación", question: "¿Muestra flexibilidad ante nuevas responsabilidades y desafíos?" },
];

export default function SurveyQuestionsTab({ companyId }: SurveyQuestionsTabProps) {
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState({ question: '', category: '' });
    const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<SurveyQuestion | null>(null);
    const [showBaseQuestionsModal, setShowBaseQuestionsModal] = useState(false);

    useEffect(() => {
        const questionsRef = collection(db, `companies/${companyId}/surveyQuestions`);
        const q = query(questionsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const questionsData: SurveyQuestion[] = [];
            querySnapshot.forEach((doc) => {
                questionsData.push({ id: doc.id, ...doc.data() } as SurveyQuestion);
            });
            setQuestions(questionsData);

            if (questionsData.length === 0) {
                setShowBaseQuestionsModal(true);
            }
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

    const handleAddBaseQuestions = async () => {
        try {
            const questionsRef = collection(db, `companies/${companyId}/surveyQuestions`);
            for (const question of BASE_QUESTIONS) {
                await addDoc(questionsRef, question);
            }
            setShowBaseQuestionsModal(false);
            toast.success("Preguntas base añadidas exitosamente.");
        } catch (error) {
            console.error("Error al añadir preguntas base:", error);
            toast.error("Error al añadir preguntas base.");
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                    autoFocus
                    placeholder="Nueva pregunta"
                    aria-label="Nueva pregunta"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                />
                <div className="flex gap-4">
                    <Select
                        placeholder="Categoría"
                        aria-label="Categoría"
                        selectedKeys={newQuestion.category ? [newQuestion.category] : []}
                        onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                        className='w-60 sm:w-44'
                    >
                        {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </Select>
                    <Button color="primary" className='w-36' onPress={handleAddQuestion} endContent={<FaPlus />} >Agregar </Button>
                </div>
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

            <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='outside'>
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

            <Modal isOpen={showBaseQuestionsModal} onClose={() => setShowBaseQuestionsModal(false)}>
                <ModalContent>
                    <ModalHeader>Añadir Preguntas Base</ModalHeader>
                    <ModalBody>
                        <p>No hay preguntas en la encuesta. ¿Deseas añadir las preguntas base?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setShowBaseQuestionsModal(false)}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleAddBaseQuestions} endContent={<FaClipboardList />}>
                            Añadir Preguntas Base
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
