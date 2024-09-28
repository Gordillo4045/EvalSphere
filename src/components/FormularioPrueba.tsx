import { useState } from 'react';
import { Button, Textarea, RadioGroup, Radio, Spacer } from '@nextui-org/react';
import { db } from "../config/config"
import { addDoc, collection } from 'firebase/firestore';
import { toast } from 'sonner';


const FormularioPrueba = () => {
  const [formData, setFormData] = useState({
    communication: '',
    decisionMaking: '',
    delegationExample: '',
    teamwork: '',
    teamContribution: '',
    timeManagement: '',
    personalDevelopment: '',
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "evaluations"), formData);
      toast.success('Evaluación enviada correctamente');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Habilidades de Liderazgo</h3>
      <RadioGroup
        label="Comunicación Efectiva"
        value={formData.communication}
        onChange={handleChange}
        name="communication"
      >
        {[1, 2, 3, 4, 5].map(value => (
          <Radio key={value} value={value.toString()}>{value}</Radio>
        ))}
      </RadioGroup>
      <Spacer y={1} />

      <RadioGroup
        label="Toma de Decisiones"
        value={formData.decisionMaking}
        onChange={handleChange}
        name="decisionMaking"
      >
        {[1, 2, 3, 4, 5].map(value => (
          <Radio key={value} value={value.toString()}>{value}</Radio>
        ))}
      </RadioGroup>
      <Spacer y={1} />

      <Textarea
        label="Delegación de Responsabilidades"
        name="delegationExample"
        placeholder="Describe un ejemplo..."
        value={formData.delegationExample}
        onChange={handleChange}
      />
      <Spacer y={1} />

      <h3>Trabajo en Equipo</h3>
      <RadioGroup
        label="Colaboración con Colegas"
        value={formData.teamwork}
        onChange={handleChange}
        name="teamwork"
      >
        {[1, 2, 3, 4, 5].map(value => (
          <Radio key={value} value={value.toString()}>{value}</Radio>
        ))}
      </RadioGroup>
      <Spacer y={1} />

      <Textarea
        label="Contribución al Éxito del Equipo"
        name="teamContribution"
        placeholder="Describe un ejemplo..."
        value={formData.teamContribution}
        onChange={handleChange}
      />
      <Spacer y={1} />

      <h3>Desempeño y Desarrollo</h3>
      <RadioGroup
        label="Manejo del Tiempo"
        value={formData.timeManagement}
        onChange={handleChange}
        name="timeManagement"
      >
        {[1, 2, 3, 4, 5].map(value => (
          <Radio key={value} value={value.toString()}>{value}</Radio>
        ))}
      </RadioGroup>
      <Spacer y={1} />

      <Textarea
        label="Desarrollo Personal"
        name="personalDevelopment"
        placeholder="Describe áreas de mejora..."
        value={formData.personalDevelopment}
        onChange={handleChange}
      />
      <Spacer y={2} />

      <Button type="submit">Enviar Evaluación</Button>
    </form>
  );
};

export default FormularioPrueba;
