import React, { useState } from "react";
import { Pricing } from "@/components/blocks/pricing";
import CompanySignUpForm from "@/components/company/CompanySignUpForm";

const demoPlans = [
  {
    name: "Starter",
    price: "499",
    yearlyPrice: "399",
    period: "mes",
    features: [
      "Creación de hasta 3 formularios de evaluación 360°.",
      "Evaluaciones limitadas a 50 participantes por mes.",
      "Reporte de resultados en formato PDF.",
      "Soporte por correo electrónico.",
    ],
    description: "Ideal para equipos pequeños que inician con la evaluación 360°.",
    buttonText: "Comprar",
    href: "#",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "1199",
    yearlyPrice: "959",
    period: "mes",
    features: [
      "Creación ilimitada de formularios de evaluación.",
      "Hasta 500 evaluaciones al mes.",
      "Acceso a plantillas personalizables.",
      "Reporte de resultados en formato PDF.",
      "Reportes avanzados con gráficos y análisis detallado.",
      "Soporte prioritario.",
    ],
    description: "Diseñado para equipos en crecimiento que buscan mayor personalización y análisis.",
    buttonText: "Comprar",
    href: "#",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "3499",
    yearlyPrice: "2799",
    period: "mes",
    features: [
      "Formularios y evaluaciones ilimitadas.",
      "Personalización de marca y plantillas a medida.",
      "Informes en tiempo real y paneles de control interactivos.",
      "Funcionalidades avanzadas como análisis de datos y métricas de rendimiento.",
      "Soporte dedicado con un gerente de cuenta.",
    ],
    description: "Perfecto para grandes empresas con necesidades específicas y equipos en múltiples áreas.",
    buttonText: "Comprar",
    href: "#",
    isPopular: false,
  },
];

const PricingSection: React.FC = () => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const handlePurchaseClick = () => {
    setIsSignUpModalOpen(true);
  };

  return (
    <>
      <Pricing
        plans={demoPlans.map(plan => ({
          ...plan,
          onClick: handlePurchaseClick
        }))}
      />
      <CompanySignUpForm
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />
    </>
  );
};

export default PricingSection;
