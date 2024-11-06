// src/components/PricingSection.tsx
import React from "react";
import { RainbowButton } from "@/components/ui/rainbow-button";

const PricingSection: React.FC = () => {
  return (
    <div className="rounded-3xl shadow-2xl flex flex-col items-center py-16 dark:bg-neutral-900 border">
      <div className="flex flex-wrap justify-center gap-2">
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-72 transform transition-transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-4 text-color-3">Starter</h3>
          <h4 className="text-small font-thin mb-4">
            Ideal para equipos pequeños que inician con la evaluación 360.
          </h4>
          <p className="text-2xl font-bold mb-4">$499 MXN/mes</p>
          <ul className="mb-1 space-y-2 pb-40 text-small">
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Creación de hasta 3 formularios de evaluación 360.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Evaluaciones limitadas a 50 participantes por mes.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Reporte de resultados en formato PDF.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Soporte por correo electrónico.
              </li>
          </ul>
          <div>
          <RainbowButton>Comprar</RainbowButton>
          </div>
        </div>
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-72 transform transition-transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-4 text-color-3">Pro</h3>
          <h4 className="text-small font-thin mb-4">
            Diseñado para equipos en crecimiento que buscan mayor
            personalización y análisis.
          </h4>
          <p className="text-2xl font-bold mb-4">$1,199 MXN/mes</p>
          <ul className="mb-12 space-y-2 pb-1 text-small">
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Creación ilimitada de formularios de evaluación.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Hasta 500 evaluaciones al mes.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Acceso a plantillas personalizables.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Reportes avanzados con gráficos y análisis detallado.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Integración con herramientas de terceros (Google Sheets, Excel).
            </li>
            <li>Soporte prioritario.</li>
          </ul>
          <div className="pt-4">
          <RainbowButton>Comprar</RainbowButton>
          </div>
        </div>

        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-72 transform transition-transform hover:scale-105 text-balance">
          <h3 className="text-2xl font-semibold mb-4 text-color-3">
            Enterprise
          </h3>
          <h4 className="text-small font-thin mb-4">
            Perfecto para grandes empresas con necesidades específicas y equipos
            en múltiples áreas.
          </h4>
          <p className="text-2xl font-bold mb-4">$3,499 MXN/mes</p>
          <ul className="mb-12 space-y-2 text-small">
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Formularios y evaluaciones ilimitadas.
            </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Personalización de marca y plantillas a medida.
              </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Informes en tiempo real y paneles de control interactivos.</li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Funcionalidades avanzadas como análisis de datos y métricas de
              rendimiento.
            </li>
            <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-5 text-color-3 inline-block mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Soporte dedicado con un gerente de cuenta.
              </li>
          </ul>
          <div className="pt-2">
            <RainbowButton>Comprar</RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
