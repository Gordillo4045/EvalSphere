import { useState, useEffect } from 'react';
import { Slider, Textarea, Button, Spinner, Card, CardHeader, CardBody, Autocomplete, AutocompleteItem, AutocompleteSection, Avatar, Divider, Chip } from '@nextui-org/react';
import { db, auth } from "@/config/config";
import { addDoc, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { Position } from '@/types/applicaciontypes';
import { UserRound } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface FormData {
  [key: string]: number | string;
}

interface Question {
  id: string;
  question: string;
  category: string;
}

const FormularioPrueba = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [evaluatedUserId, setEvaluatedUserId] = useState<string>('');
  const [employees, setEmployees] = useState<Array<{ id: string, name: string, avatar: string, email: string, positionId: string, departmentId: string, position: string }>>([]);
  const [currentUserPositionId, setCurrentUserPositionId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [evaluatedEmployees, setEvaluatedEmployees] = useState<Set<string>>(new Set());
  const [currentUserData, setCurrentUserData] = useState<{ id: string, name: string, avatar: string, email: string, positionId: string, departmentId: string, position: string } | null>(null);
  const [allEvaluated, setAllEvaluated] = useState(false);
  const [autocompleteKey, setAutocompleteKey] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchUserData(user.uid);
        fetchEmployees(user.uid);
      } else {
        setLoading(false);
        toast.error('No hay usuario autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId && companyId) {
      fetchEvaluatedEmployees(currentUserId, companyId);
    }
  }, [currentUserId, companyId]);

  useEffect(() => {
    if (employees.length > 0 && currentUserId) {
      const isAllEvaluated = evaluatedEmployees.size === employees.length + 1 && evaluatedEmployees.has(currentUserId);
      setAllEvaluated(isAllEvaluated);
    }
  }, [evaluatedEmployees, employees, currentUserId]);

  const fetchUserData = async (userId: string) => {
    try {
      const employeeDocRef = doc(db, 'employees', userId);
      const employeeDocSnap = await getDoc(employeeDocRef);

      if (employeeDocSnap.exists()) {
        const userData = employeeDocSnap.data();
        setCompanyId(userData.companyId);
        setCurrentUserPositionId(userData.positionId);

        await fetchCompanyQuestions(userData.companyId);
        await fetchPositions(userData.companyId, userData.departmentId);
      } else {
        toast.error('No se encontró el usuario en ninguna empresa');
      }
    } catch (error) {
      console.error("Error al buscar los datos del usuario:", error);
      toast.error('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyQuestions = async (companyId: string) => {
    try {
      const questionsSnapshot = await getDocs(collection(db, `companies/${companyId}/surveyQuestions`));
      const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
      setQuestions(questionsData);

      const initialFormData: FormData = {};
      questionsData.forEach(question => {
        initialFormData[question.id] = 1;
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error al obtener las preguntas de la empresa:", error);
      toast.error('Error al cargar las preguntas');
    }
  };

  const fetchEmployees = async (userId: string) => {
    try {
      const employeeDocRef = doc(db, 'employees', userId);
      const employeeDocSnap = await getDoc(employeeDocRef);

      if (employeeDocSnap.exists()) {
        const userData = employeeDocSnap.data();
        const companyId = userData.companyId;
        const userDepartmentId = userData.departmentId;
        const employeesSnapshot = await getDocs(collection(db, `companies/${companyId}/employees`));
        const employeesData = employeesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            avatar: doc.data().avatar,
            email: doc.data().email,
            positionId: doc.data().positionId,
            departmentId: doc.data().departmentId,
            position: ''
          }))
          .filter(emp => emp.departmentId === userDepartmentId);

        for (let employee of employeesData) {
          const positionDoc = await getDoc(doc(db, `companies/${companyId}/departments/${employee.departmentId}/positions/${employee.positionId}`));
          if (positionDoc.exists()) {
            employee.position = positionDoc.data().title;
          }
        }

        const currentUser = employeesData.find(emp => emp.id === userId);
        if (currentUser) {
          setCurrentUserData(currentUser);
          setEmployees(employeesData.filter(emp => emp.id !== userId));
        } else {
          setEmployees(employeesData);
        }
      }
    } catch (error) {
      console.error("Error al obtener la lista de empleados:", error);
      toast.error('Error al cargar la lista de empleados');
    }
  };

  const fetchPositions = async (companyId: string, departmentId: string) => {
    try {
      const positionsSnapshot = await getDocs(collection(db, `companies/${companyId}/departments/${departmentId}/positions`));
      const positionsData = positionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Position));
      setPositions(positionsData);
    } catch (error) {
      console.error("Error al obtener las posiciones:", error);
      toast.error('Error al cargar las posiciones');
    }
  };

  const fetchEvaluatedEmployees = async (userId: string, companyId: string) => {
    try {
      const evaluationsRef = collection(db, `companies/${companyId}/evaluations`);
      const q = query(evaluationsRef, where("evaluatorId", "==", userId));
      const querySnapshot = await getDocs(q);
      const evaluatedIds = new Set(querySnapshot.docs.map(doc => doc.data().evaluatedId));
      setEvaluatedEmployees(evaluatedIds);
    } catch (error) {
      console.error("Error al obtener las evaluaciones realizadas:", error);
      toast.error('Error al cargar las evaluaciones realizadas');
    }
  };

  const isEmployeeEvaluated = (employeeId: string) => {
    return evaluatedEmployees.has(employeeId);
  };

  const getRelationshipType = (evaluatorPositionId: string | null, evaluatedPositionId: string): string => {
    if (!evaluatorPositionId || !evaluatedPositionId) {
      return 'No especificado';
    }

    const evaluatorPosition = positions.find(p => p.id === evaluatorPositionId);
    const evaluatedPosition = positions.find(p => p.id === evaluatedPositionId);

    if (!evaluatorPosition || !evaluatedPosition) {
      return 'No especificado';
    }

    if (evaluatorPosition.department === evaluatedPosition.department) {
      if (evaluatorPosition.level < evaluatedPosition.level) {
        return 'Jefe';
      } else if (evaluatorPosition.level > evaluatedPosition.level) {
        return 'Subordinado';
      } else {
        return 'Colega';
      }
    }
  };

  const groupEmployeesByRelationship = () => {
    const groups: Record<string, Array<{ id: string, name: string, avatar: string, email: string, positionId: string, departmentId: string, position: string }>> = {
      Autoevaluación: currentUserData ? [currentUserData] : [],
      Jefe: [],
      Subordinado: [],
      Colega: [],
    };

    employees.forEach(employee => {
      const relationshipType = getRelationshipType(currentUserPositionId, employee.positionId);
      if (groups[relationshipType]) {
        groups[relationshipType].push(employee);
      }
    });

    return groups;
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !currentUserId || !evaluatedUserId) {
      toast.error('Faltan datos necesarios para enviar la evaluación');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        comments,
        evaluatorId: currentUserId,
        evaluatedId: evaluatedUserId,
        timestamp: new Date()
      };
      await addDoc(collection(db, `companies/${companyId}/evaluations`), dataToSubmit);

      setEvaluatedEmployees(prev => new Set(prev).add(evaluatedUserId));

      setEvaluatedUserId('');
      setComments('');
      setFormData({});
      setAutocompleteKey(prevKey => prevKey + 1);

      toast.success('Evaluación enviada correctamente');

      if (evaluatedEmployees.size + 1 === employees.length + 1) {
        setAllEvaluated(true);
      }
    } catch (error) {
      console.error("Error al añadir documento: ", error);
      toast.error('Error al enviar la evaluación');
    }
  };

  if (loading) {
    return <div className='flex justify-center items-center min-h-dvh'>
      <Spinner color="primary" label="Cargando datos..." />
    </div>;
  }

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className={`w-full h-fit flex flex-col shadow-inner dark:shadow-slate-300/20 rounded-xl p-3`}>
      <Card className='min-h-[calc(100vh-200px)]'>
        <CardHeader className="flex justify-center">
          <h1 className="text-lg font-bold mb-6 text-center">Evaluación de Habilidades 360°</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-10 mx-auto mb-2">
            <div className="w-full mb-4 relative">
              <Autocomplete
                key={autocompleteKey}
                defaultItems={[...(currentUserData ? [currentUserData] : []), ...employees]}
                label="Selecciona a quién evaluar"
                placeholder="Buscar empleado..."
                value={evaluatedUserId}
                onSelectionChange={(key) => setEvaluatedUserId(key as string)}
                required
                variant="bordered"
                labelPlacement="outside"
                className="w-full"
                startContent={<UserRound className="text-default-400" />}
                disabledKeys={Array.from(evaluatedEmployees)}
                scrollShadowProps={{
                  isEnabled: false,
                }}
              >
                {Object.entries(groupEmployeesByRelationship()).map(([relationshipType, groupEmployees]) => (
                  groupEmployees.length > 0 && (
                    <AutocompleteSection
                      key={relationshipType}
                      title={relationshipType}
                      classNames={{
                        heading: "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small",
                      }}
                    >
                      {groupEmployees.map((employee) => (
                        <AutocompleteItem
                          key={employee.id}
                          value={employee.id}
                          textValue={employee.name}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex gap-2 items-center">
                              <Avatar
                                alt={employee.name}
                                className="flex-shrink-0"
                                size="sm"
                                src={employee.avatar}
                              />
                              <div className="flex flex-col">
                                <span className="text-small font-medium">{employee.name}</span>
                                <span className="text-tiny text-default-400">{employee.position}</span>
                              </div>
                            </div>
                            {isEmployeeEvaluated(employee.id) && (
                              <Chip size="sm" color="success" variant="flat">
                                Evaluado
                              </Chip>
                            )}
                          </div>
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                  )
                ))}
              </Autocomplete>
            </div>
            {!allEvaluated && (
              <>
                {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
                  <div key={category} className="space-y-4">
                    <Divider className="my-2" />
                    <h3 className="text-base font-semibold">{category}</h3>
                    {categoryQuestions.map((question) => (
                      <div key={question.id} className=" w-full">
                        <Slider
                          aria-label={question.question}
                          label={question.question}
                          color="foreground"
                          step={1}
                          maxValue={5}
                          minValue={1}
                          marks={[
                            { value: 1, label: "Muy bajo" },
                            { value: 2, label: "Bajo" },
                            { value: 3, label: "Regular" },
                            { value: 4, label: "Alto" },
                            { value: 5, label: "Muy alto" },
                          ]}
                          defaultValue={1}
                          value={formData[question.id] as number}
                          onChange={(value) => handleSliderChange(question.id, value as number)}
                          className="w-full mb-10"
                          hideValue
                          classNames={{
                            mark: "text-muted-foreground dark:text-muted-foreground-dark text-xs whitespace-normal md:whitespace-nowrap md:text-sm",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                <div className="w-full flex flex-col gap-2">
                  <Divider className="my-" />

                  <Textarea
                    variant="underlined"
                    label="Comentarios adicionales (opcional)"
                    labelPlacement="outside"
                    placeholder="Escribe tus comentarios aquí..."
                    value={comments}
                    onValueChange={setComments}
                  />
                </div>

                <Button type="submit" color="primary" className="w-full" isDisabled={allEvaluated}>
                  Enviar Evaluación
                </Button>
              </>
            )}
            {allEvaluated && (
              <Alert className="mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>¡Felicidades!</AlertTitle>
                <AlertDescription>
                  Has completado la evaluación de todos tus compañeros y tu autoevaluación.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default FormularioPrueba;