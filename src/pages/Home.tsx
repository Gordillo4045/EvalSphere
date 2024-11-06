import { MarqueeReview } from "@/components/MarqueeReview";
import { useTheme } from "@/components/ThemeProvider";
import BlurIn from "@/components/ui/blur-in";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import PricingSection from "@/components/PricingSection";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { motion } from "framer-motion";
import BlurFade from "@/components/ui/blur-fade";

const accordion1 =
  "Una evaluación de desempeño 360 es un proceso de retroalimentación en el que un empleado recibe evaluaciones de múltiples fuentes, incluyendo supervisores, compañeros de trabajo, subordinados y, a veces, clientes. El objetivo es obtener una visión integral del desempeño del empleado desde diferentes perspectivas. A menudo incluye una autoevaluación por parte del empleado.";
const accordion2 =
  "La evaluación 360 proporciona a los empleados una retroalimentación más completa y detallada, lo que les permite identificar áreas de mejora y fortalezas. Para la organización, es una herramienta valiosa para desarrollar el talento, mejorar la comunicación interna y fortalecer la cultura de retroalimentación. También puede mejorar la autoconciencia de los empleados, fomentando el crecimiento y el desarrollo profesional.";
const accordion3 =
  "La confidencialidad es clave para garantizar que los participantes brinden retroalimentación honesta y constructiva. Por lo general, los comentarios se recopilan de forma anónima, especialmente cuando provienen de compañeros y subordinados. Los resultados se presentan de manera agregada para proteger la identidad de los evaluadores, lo que aumenta la confianza en el proceso y fomenta una mayor participación.";

export default function Home() {
  useTheme();
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-0">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={1.1}
        duration={1}
        repeatDelay={4}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="flex flex-col overflow-hidden -translate-y-32">
        <ContainerScroll
          titleComponent={
            <>
              <BlurIn
                word="EvalSphere"
                className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
                duration={1.5}
                variant={{
                  hidden: { filter: "blur(15px)", opacity: 0 },
                  visible: { filter: "blur(0px)", opacity: 1 },
                }}
              />
              <br />
              <BlurIn
                word="Evaluación de desempeño 360°"
                className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-3xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
                duration={1.5}
                variant={{
                  hidden: { filter: "blur(15px)", opacity: 0 },
                  visible: { filter: "blur(0px)", opacity: 1 },
                }}
              />
            </>
          }
          children={""}
        ></ContainerScroll>
      </div>

      <section className="rounded-xl py-10 dark:bg-neutral-850 text-neutral-950 dark:text-neutral-50 sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            
          <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
            >
            <h2 className="mt-6 text-3xl font-bold leading-tight text-black dark:text-neutral-50 sm:text-4xl lg:text-5xl">
              Objetivos
            </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
            >
            <p className="mt-4 text-justify text-base leading-relaxed text-neutral-950 dark:text-neutral-50">
              La evaluación 360° permite a las organizaciones analizar el
              rendimiento y potencial de sus empleados de forma integral,
              utilizando el feedback de diferentes niveles y roles. Los
              principales objetivos de esta metodología incluyen:
            </p>
            </motion.div>
          </div>

          <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.0 }}
              viewport={{ once: true }}
            >
          <div className="grid grid-cols-2 gap-5 mt-12 sm:grid-cols-2 lg:grid-cols-5 lg:mt-20 lg:gap-x-12 text-neutral-950 dark:text-neutral-50">
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Medir el rendimiento de los empleados.
                </p>
              </div>
            </div>

            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Evaluar las competencias.
                </p>
              </div>
            </div>

            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Diseñar programas de aprendizaje y desarrollo.
                </p>
              </div>
            </div>

            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Implementar planes de carrera y sucesión.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Mejorar la cultura organizacional.
                </p>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </section>
      <section className="rounded-xl py-10 dark:bg-neutral-850 text-neutral-950 dark:text-neutral-50 sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
          <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
            >
            <h2 className="mt-6 text-3xl font-bold leading-tight text-black dark:text-neutral-50 sm:text-4xl lg:text-5xl">
              Beneficios
            </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
            >
            <p className="mt-4 text-base leading-relaxed text-justify text-neutral-950 dark:text-neutral-50">
              La evaluación 360° es una herramienta poderosa que aporta
              múltiples beneficios para el desarrollo y fortalecimiento del
              equipo, tanto a nivel individual como organizacional. Entre sus
              principales beneficios se encuentran:
            </p>
            </motion.div>
          </div>
          <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.0 }}
              viewport={{ once: true }}
            >
          <div className="grid grid-cols-2 gap-5 mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:mt-20 lg:gap-x-12 text-neutral-950 dark:text-neutral-50">
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Evita sesgos.
                </p>
              </div>
            </div>

            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Es más objetivo.
                </p>
              </div>
            </div>

            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Fomenta la formacón de equipos de trabajo.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Permite evaluar las competencias clave del puesto.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Mejora la equidad y poromoción interna justa.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Fomenta la comunicacion horizontal.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Motiva a los empleados a mejorar.
                </p>
              </div>
            </div>
            <div className="transition-all duration-200 dark:bg-neutral-850 hover:shadow-xl hover:translate-y-[-2px] rounded-lg">
              <div className="py-10 px-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <h3 className="mt-8 text-lg font-semibold text-black dark:text-neutral-50"></h3>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  Identifica necesidades de desarrollo.
                </p>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
        
      </section>
      <div className="flex flex-col gap-2 -translate-y-[25%] md:-translate-y-[30%] pt-80">
        <div className="pl-10 pr-10 pb-1 md:pl-10 md:pr-10">
          <section id="header">
            <BlurFade delay={0.25} inView>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Preguntas
              </h2>
            </BlurFade>
            <BlurFade delay={0.25 * 2} inView>
              <span className="text-xl text-pretty tracking-tighter sm:text-3xl xl:text-4xl/none">
                Frecuentes
              </span>
            </BlurFade>
          </section>
          <Accordion
            motionProps={{
              variants: {
                enter: {
                  y: 0,
                  opacity: 1,
                  height: "auto",
                  transition: {
                    height: {
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      duration: 1,
                    },
                    opacity: {
                      easings: "ease",
                      duration: 1,
                    },
                  },
                },
                exit: {
                  y: -10,
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      easings: "ease",
                      duration: 0.25,
                    },
                    opacity: {
                      easings: "ease",
                      duration: 0.3,
                    },
                  },
                },
              },
            }}
          >
            <AccordionItem
              key="1"
              aria-label="Accordion 1"
              title="¿Qué es una evaluación de desempeño 360?"
            >
              {accordion1}
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label="Accordion 2"
              title="¿Cómo beneficia la evaluación 360 a los empleados y a la organización?"
            >
              {accordion2}
            </AccordionItem>
            <AccordionItem
              key="3"
              aria-label="Accordion 3"
              title="¿Cómo se asegura la confidencialidad en una evaluación 360?"
            >
              {accordion3}
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <MarqueeReview />
      <div className="pb-30">
        <PricingSection />
        <div className="rounded-lg shadow-md mx-auto p-6 max-w-4xl">
          <p className="text-gray-800 font-semibold text-lg mb-5"></p>
          <div className="justify-around flex flex-wrap">
            <div className="m-2">
              <img
                src="./img/paypal.png"
                alt="PayPal payment method"
                className="h-40 mx-auto"
              />
            </div>
            <div className="m-2">
              <img
                src="./img/visa.png"
                alt="Visa payment method"
                className="h-40 mx-auto"
              />
            </div>
            <div className="m-2">
              <img
                src="./img/mastercard.png"
                alt="MasterCard payment method"
                className="h-40
          mx-auto"
              />
            </div>
            <div className="m-2">
              <img
                src="./img/american.png"
                alt="American payment method"
                className="h-40 mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
