import { useState, useEffect } from 'react';
import { Slider, Textarea, Button, Spinner, Card, CardHeader, CardBody } from '@nextui-org/react';
import { db, auth } from "@/config/config";
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCompanyIdAndQuestions(user.uid);
      } else {
        setLoading(false);
        toast.error('No hay usuario autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCompanyIdAndQuestions = async (userId: string) => {
    try {
      const employeeDocRef = doc(db, 'employees', userId);
      const employeeDocSnap = await getDoc(employeeDocRef);

      if (employeeDocSnap.exists()) {
        const companyId = employeeDocSnap.data().companyId;
        setCompanyId(companyId);

        const questionsSnapshot = await getDocs(collection(db, `companies/${companyId}/surveyQuestions`));
        const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
        setQuestions(questionsData);

        const initialFormData: FormData = {};
        questionsData.forEach(question => {
          initialFormData[question.id] = 1;
        });
        setFormData(initialFormData);
      } else {
        toast.error('No se encontró el usuario en ninguna empresa');
      }
    } catch (error) {
      console.error("Error al buscar la empresa del usuario:", error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error('No se pudo determinar la empresa del usuario');
      return;
    }

    try {
      const dataToSubmit = { ...formData, comments };
      await addDoc(collection(db, `companies/${companyId}/evaluations`), dataToSubmit);
      toast.success('Evaluación enviada correctamente');
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
      <Card >
        <CardHeader>
          <h1 className="text-lg font-bold mb-6">Evaluación de Habilidades</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-10 mx-auto  ">
            {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
              <div key={category} className="space-y-4">
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
                        { value: 1, label: "1" },
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                        { value: 5, label: "5" },
                      ]}
                      defaultValue={1}
                      value={formData[question.id] as number}
                      onChange={(value) => handleSliderChange(question.id, value as number)}
                      className="w-full mb-4"
                      hideValue
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="w-full flex flex-col gap-2">
              <Textarea
                variant="underlined"
                label="Comentarios adicionales (opcional)"
                labelPlacement="outside"
                placeholder="Escribe tus comentarios aquí..."
                value={comments}
                onValueChange={setComments}
              />
            </div>

            <Button type="submit" color="primary" className="w-full">
              Enviar Evaluación
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default FormularioPrueba;
