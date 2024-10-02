import { useState, useEffect } from 'react';
import { Button, Textarea, RadioGroup, Radio, Spacer } from '@nextui-org/react';
import { db, auth } from "../config/config"
import { addDoc, collection, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import { toast } from 'sonner';

interface FormData {
  [key: string]: string;
}

const FormularioPrueba = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [questions, setQuestions] = useState([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyIdAndQuestions = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const employeesQuery = query(
            collectionGroup(db, 'employees'),
            where('uid', '==', user.uid)
          );
          const employeesSnapshot = await getDocs(employeesQuery);

          if (!employeesSnapshot.empty) {
            const employeeDoc = employeesSnapshot.docs[0];
            const companyId = employeeDoc.ref.parent.parent.id;
            setCompanyId(companyId);

            const questionsSnapshot = await getDocs(collection(db, `companies/${companyId}/surveyQuestions`));
            const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(questionsData);

            const initialFormData: Record<string, string> = {};
            questionsData.forEach(question => {
              initialFormData[question.id] = '';
            });
            setFormData(initialFormData);
          } else {
            toast.error('No se encontró el usuario en ninguna empresa');
          }
        } catch (error) {
          console.error("Error al buscar la empresa del usuario:", error);
          toast.error('Error al cargar los datos');
        }
      }
    };

    fetchCompanyIdAndQuestions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!companyId) {
      toast.error('No se pudo determinar la empresa del usuario');
      return;
    }

    try {
      await addDoc(collection(db, `companies/${companyId}/evaluations`), formData);
      toast.success('Evaluación enviada correctamente');
    } catch (e) {
      console.error("Error al añadir documento: ", e);
      toast.error('Error al enviar la evaluación');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((question) => (
        <div key={question.id}>
          <h3>{question.category}</h3>
          <RadioGroup
            label={question.question}
            value={formData[question.question]}
            onChange={handleChange}
            name={question.id}
            orientation="horizontal"
          >
            {[1, 2, 3, 4, 5].map(value => (
              <Radio key={value} value={value.toString()}>{value}</Radio>
            ))}
          </RadioGroup>


          <Spacer y={1} />
        </div>
      ))}
      <Textarea
        placeholder="Escribe tu respuesta aquí..."
        onChange={handleChange}
      />
      <Spacer y={2} />
      <Button type="submit">Enviar Evaluación</Button>
    </form>
  );
};

export default FormularioPrueba;
