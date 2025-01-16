import { MarqueeReview } from "@/components/MarqueeReview";
import { useTheme } from "@/components/ThemeProvider";
import BlurIn from "@/components/ui/blur-in";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import PricingSection from "@/components/PricingSection";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";
import BlurFade from "@/components/ui/blur-fade";

const accordion1 =
  "Una evaluación de desempeño 360° es un proceso de retroalimentación en el que un empleado recibe evaluaciones de múltiples fuentes, incluyendo supervisores, compañeros de trabajo, subordinados y, a veces, clientes. El objetivo es obtener una visión integral del desempeño del empleado desde diferentes perspectivas. A menudo incluye una autoevaluación por parte del empleado.";
const accordion2 =
  "La evaluación 360° proporciona a los empleados una retroalimentación más completa y detallada, lo que les permite identificar áreas de mejora y fortalezas. Para la organización, es una herramienta valiosa para desarrollar el talento, mejorar la comunicación interna y fortalecer la cultura de retroalimentación. También puede mejorar la autoconciencia de los empleados, fomentando el crecimiento y el desarrollo profesional.";
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
                    Mejora la equidad y promoción interna justa.
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
              title="¿Qué es una evaluación de desempeño 360°?"
            >
              {accordion1}
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label="Accordion 2"
              title="¿Cómo beneficia la evaluación 360° a los empleados y a la organización?"
            >
              {accordion2}
            </AccordionItem>
            <AccordionItem
              key="3"
              aria-label="Accordion 3"
              title="¿Cómo se asegura la confidencialidad en una evaluación 360°?"
            >
              {accordion3}
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <MarqueeReview />
      <div className="pb-30">
        <PricingSection />
        <div className="rounded-lg shadow-md mx-auto p-6 max-w-5xl">
          <p className="text-gray-800 font-semibold text-lg mb-5"></p>
          <div className="justify-around flex flex-wrap">
            <div className="m-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="150"
                preserveAspectRatio="xMidYMid"
                viewBox="0 0 256 302"
                id="paypal"
              >
                <path
                  fill="#27346A"
                  d="M217.168 23.507C203.234 7.625 178.046.816 145.823.816h-93.52A13.393 13.393 0 0 0 39.076 12.11L.136 259.077c-.774 4.87 2.997 9.28 7.933 9.28h57.736l14.5-91.971-.45 2.88c1.033-6.501 6.593-11.296 13.177-11.296h27.436c53.898 0 96.101-21.892 108.429-85.221.366-1.873.683-3.696.957-5.477-1.556-.824-1.556-.824 0 0 3.671-23.407-.025-39.34-12.686-53.765"
                ></path>
                <path
                  fill="#27346A"
                  d="M102.397 68.84a11.737 11.737 0 0 1 5.053-1.14h73.318c8.682 0 16.78.565 24.18 1.756a101.6 101.6 0 0 1 6.177 1.182 89.928 89.928 0 0 1 8.59 2.347c3.638 1.215 7.026 2.63 10.14 4.287 3.67-23.416-.026-39.34-12.687-53.765C203.226 7.625 178.046.816 145.823.816H52.295C45.71.816 40.108 5.61 39.076 12.11L.136 259.068c-.774 4.878 2.997 9.282 7.925 9.282h57.744L95.888 77.58a11.717 11.717 0 0 1 6.509-8.74z"
                ></path>
                <path
                  fill="#2790C3"
                  d="M228.897 82.749c-12.328 63.32-54.53 85.221-108.429 85.221H93.024c-6.584 0-12.145 4.795-13.168 11.296L61.817 293.621c-.674 4.262 2.622 8.124 6.934 8.124h48.67a11.71 11.71 0 0 0 11.563-9.88l.474-2.48 9.173-58.136.591-3.213a11.71 11.71 0 0 1 11.562-9.88h7.284c47.147 0 84.064-19.154 94.852-74.55 4.503-23.15 2.173-42.478-9.739-56.054-3.613-4.112-8.1-7.508-13.327-10.28-.283 1.79-.59 3.604-.957 5.477z"
                ></path>
                <path
                  fill="#1F264F"
                  d="M216.952 72.128a89.928 89.928 0 0 0-5.818-1.49 109.904 109.904 0 0 0-6.177-1.174c-7.408-1.199-15.5-1.765-24.19-1.765h-73.309a11.57 11.57 0 0 0-5.053 1.149 11.683 11.683 0 0 0-6.51 8.74l-15.582 98.798-.45 2.88c1.025-6.501 6.585-11.296 13.17-11.296h27.444c53.898 0 96.1-21.892 108.428-85.221.367-1.873.675-3.688.958-5.477-3.122-1.648-6.501-3.072-10.14-4.279a83.26 83.26 0 0 0-2.77-.865"
                ></path>
              </svg>
            </div>
            <div className="m-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="200"
                height="150"
                viewBox="0 0 141.732 141.732"
                id="visa"
              >
                <g fill="#2566af">
                  <path d="M62.935 89.571h-9.733l6.083-37.384h9.734zM45.014 52.187L35.735 77.9l-1.098-5.537.001.002-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s4.691.976 10.181 4.273l8.456 32.479h10.141l15.485-37.385H45.014zM121.569 89.571h8.937l-7.792-37.385h-7.824c-3.613 0-4.493 2.786-4.493 2.786L95.881 89.571h10.146l2.029-5.553h12.373l1.14 5.553zm-10.71-13.224l5.114-13.99 2.877 13.99h-7.991zM96.642 61.177l1.389-8.028s-4.286-1.63-8.754-1.63c-4.83 0-16.3 2.111-16.3 12.376 0 9.658 13.462 9.778 13.462 14.851s-12.075 4.164-16.06.965l-1.447 8.394s4.346 2.111 10.986 2.111c6.642 0 16.662-3.439 16.662-12.799 0-9.72-13.583-10.625-13.583-14.851.001-4.227 9.48-3.684 13.645-1.389z"></path>
                </g>
                <path
                  fill="#e6a540"
                  d="M34.638 72.364l-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s7.373 1.528 14.445 7.253c6.762 5.472 8.967 12.292 8.967 12.292z"
                ></path>
                <path fill="none" d="M0 0h141.732v141.732H0z"></path>
              </svg>
            </div>
            <div className="m-2 pt-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="170"
                height="100"
                id="mastercard"
              >
                <g fill-rule="evenodd">
                  <path
                    fill="#e9b040"
                    d="M82.246 86.156a48.572 48.572 0 0 0 32.966 12.83 49.494 49.494 0 0 0 0-98.986 48.567 48.567 0 0 0-32.966 12.83 49.527 49.527 0 0 0 0 73.326Z"
                  ></path>
                  <path
                    fill="#e9b040"
                    d="M157.867 77.064a1.523 1.523 0 0 1 1.529-1.529 1.543 1.543 0 0 1 1.613 1.529 1.562 1.562 0 0 1-1.613 1.615 1.544 1.544 0 0 1-1.529-1.615Zm1.529 1.276a1.306 1.306 0 0 0 1.273-1.275 1.234 1.234 0 0 0-1.273-1.189 1.214 1.214 0 0 0-1.189 1.189 1.3 1.3 0 0 0 1.189 1.275Zm-.17-.51h-.34v-1.445h.594a.5.5 0 0 1 .34.086c.17.084.17.17.17.34s-.084.34-.254.34l.34.68h-.426l-.17-.6h-.254v-.255h.34c.084 0 .084-.086.084-.17s0-.086-.084-.17h-.34Z"
                  ></path>
                  <path
                    fill="#cc2131"
                    d="M98.135 44.268c-.17-1.784-.51-3.483-.85-5.268H67.207a51.824 51.824 0 0 1 1.359-5.185h27.275q-.888-2.683-2.039-5.268H70.691q1.275-2.7 2.8-5.268H90.91a44.705 44.705 0 0 0-3.738-5.183h-9.938a48.87 48.87 0 0 1 5.013-5.268 49.356 49.356 0 1 0-33.052 86.156 48.788 48.788 0 0 0 33.052-12.83 47.105 47.105 0 0 0 4.929-5.184h-9.942a58.588 58.588 0 0 1-3.739-5.268h17.419a39.518 39.518 0 0 0 2.889-5.268H70.691a55.288 55.288 0 0 1-2.125-5.184h27.275a52.957 52.957 0 0 0 1.443-5.268 52.271 52.271 0 0 0 .85-5.268 51.617 51.617 0 0 0 .256-5.184c0-1.781-.085-3.565-.255-5.264Z"
                  ></path>
                  <path
                    fill="#fff"
                    d="M157.867 61.006a1.543 1.543 0 0 1 1.529-1.613 1.561 1.561 0 0 1 1.613 1.613 1.572 1.572 0 1 1-3.142 0Zm1.529 1.189a1.192 1.192 0 1 0 0-2.378 1.189 1.189 0 0 0 0 2.378Zm-.17-.51h-.34v-1.359h.934c.17.086.17.256.17.426a.457.457 0 0 1-.254.34l.34.594h-.426l-.17-.51h-.254v-.255h.17c.084 0 .17 0 .17-.086.084 0 .084-.084.084-.17a.082.082 0 0 0-.084-.084c0-.086-.086 0-.17 0h-.17Z"
                  ></path>
                  <path
                    fill="#1b3771"
                    d="M65.508 63.81a15.713 15.713 0 0 1-3.993.68c-2.549 0-4.079-1.615-4.079-4.5a15.268 15.268 0 0 1 .17-1.875l.34-1.953.255-1.615 2.294-13.932h5.1l-.6 3.059h3.231l-.765 5.1h-3.228L62.874 57.1a3.908 3.908 0 0 0-.085.85c0 1.105.51 1.529 1.784 1.529a9.3 9.3 0 0 0 1.614-.17l-.679 4.5Zm16.484-.17a19.99 19.99 0 0 1-5.438.764c-5.778 0-9.092-3.059-9.092-9.09 0-7.053 3.909-12.151 9.346-12.151 4.333 0 7.137 2.889 7.137 7.391a23.429 23.429 0 0 1-.594 5.014H72.726a2.392 2.392 0 0 0-.085.68c0 2.379 1.614 3.568 4.673 3.568a12.811 12.811 0 0 0 5.523-1.273Zm-3.144-12.15v-1.02a2.351 2.351 0 0 0-2.549-2.634c-1.7 0-2.889 1.274-3.4 3.653h5.948ZM24.726 64.064h-5.27l3.059-19.286-6.882 19.286H11.98l-.425-19.2-3.229 19.2H3.143L7.306 39h7.732l.17 15.465L20.391 39h8.5l-4.165 25.064Zm12.831-9.09a4.823 4.823 0 0 0-1.02-.086c-3.059 0-4.588 1.189-4.588 3.059a1.923 1.923 0 0 0 1.954 2.125c2.549 0 3.568-2.125 3.654-5.1Zm4.248 9.09h-4.59l.085-2.123c-1.19 1.613-2.8 2.463-5.608 2.463-2.549 0-4.758-2.293-4.758-5.607a8.992 8.992 0 0 1 .425-2.633c.849-3.145 3.993-5.1 8.836-5.184.6 0 1.529 0 2.379.086a4.521 4.521 0 0 0 .169-1.36c0-1.36-1.1-1.785-3.568-1.785a14.177 14.177 0 0 0-4.418.68l-.765.17-.34.084.765-4.588a19.94 19.94 0 0 1 6.2-1.1c4.588 0 7.052 2.124 7.052 6.032a19.274 19.274 0 0 1-.255 3.994l-1.188 7.303-.17 1.275-.085 1.02-.085.68-.085.593Zm65.849-20.221a10.217 10.217 0 0 1 4.758 1.359l.934-5.438a11.762 11.762 0 0 0-1.359-.51l-2.123-.6a10.457 10.457 0 0 0-2.465-.255c-2.635 0-4.164.085-5.777 1.02a15.969 15.969 0 0 0-3.145 2.719l-.68-.17-5.438 3.823.256-2.124h-5.609l-3.312 20.391h5.354l1.953-10.959s.766-1.531 1.105-2.039a3.1 3.1 0 0 1 2.973-1.275h.426a27.428 27.428 0 0 0-.256 3.908c0 6.627 3.738 10.791 9.516 10.791a17.169 17.169 0 0 0 4.674-.68l.936-5.777a9.6 9.6 0 0 1-4.5 1.359c-3.143 0-5.014-2.379-5.014-6.117 0-5.523 2.8-9.431 6.8-9.431ZM152.769 39l-1.188 7.137a5.5 5.5 0 0 0-4.844-2.889 8.017 8.017 0 0 0-7.053 4.673v-.084l-3.4-2.04.34-2.124h-5.693l-3.229 20.391h5.268l1.785-10.959s1.359-1.531 1.7-2.039a3.32 3.32 0 0 1 2.379-1.275 18.378 18.378 0 0 0-.934 6.033c0 5.1 2.633 8.5 6.541 8.5a6.175 6.175 0 0 0 4.928-2.295l-.254 2.039h5.011l4.078-25.064h-5.439Zm-6.543 20.222c-1.785 0-2.719-1.359-2.719-3.994 0-3.994 1.7-6.882 4.162-6.882 1.869 0 2.8 1.445 2.8 3.994 0 4.078-1.7 6.882-4.248 6.882Zm-24.554-4.248a4.823 4.823 0 0 0-1.02-.086c-3.061 0-4.59 1.189-4.59 3.059a1.924 1.924 0 0 0 1.955 2.125c2.549 0 3.569-2.125 3.655-5.098Zm4.248 9.09h-4.674l.17-2.123c-1.189 1.613-2.8 2.463-5.607 2.463-2.635 0-4.928-2.209-4.928-5.607 0-4.842 3.652-7.816 9.43-7.816a22.039 22.039 0 0 1 2.295.086 5.231 5.231 0 0 0 .256-1.36c0-1.36-1.1-1.785-3.654-1.785a14.582 14.582 0 0 0-4.418.68l-.68.17-.34.084.764-4.588a19.955 19.955 0 0 1 6.2-1.1c4.588 0 6.967 2.124 6.967 6.032a14.634 14.634 0 0 1-.254 3.994l-1.1 7.307-.17 1.275-.17 1.02-.084.68v.592ZM52.933 48.006a25.2 25.2 0 0 1 3.994.34l.765-4.758c-1.53-.17-3.569-.425-4.759-.425-5.947 0-7.9 3.229-7.9 6.967 0 2.465 1.1 4.248 3.993 5.607 2.124 1.02 2.464 1.189 2.464 2.125 0 1.273-1.1 2.039-3.144 2.039a14.225 14.225 0 0 1-4.843-.85l-.6 4.672.084.086 1.02.17a13.386 13.386 0 0 0 1.36.254c1.274.086 2.379.17 3.059.17 5.948 0 8.412-2.293 8.412-6.8 0-2.8-1.36-4.5-3.994-5.691-2.294-1.021-2.549-1.189-2.549-2.125s1.02-1.784 2.634-1.784Z"
                  ></path>
                  <path
                    fill="#fff"
                    d="m114.789 38.15-.936 5.438a10.2 10.2 0 0 0-4.758-1.359c-3.994 0-6.8 3.908-6.8 9.431 0 3.824 1.869 6.117 5.014 6.117a10.432 10.432 0 0 0 4.5-1.273l-.934 5.691a17.7 17.7 0 0 1-4.674.766c-5.777 0-9.346-4.164-9.346-10.875 0-8.922 4.928-15.21 11.98-15.21a10.451 10.451 0 0 1 2.463.255l2.125.51c.681.255.851.34 1.361.509Zm-17.163 3.739h-.51c-1.783 0-2.8.85-4.418 3.313l.51-3.144h-4.844L85.052 62.45h5.354c1.953-12.49 2.463-14.614 5.012-14.614h.34a21.36 21.36 0 0 1 2.039-5.863l-.171-.084ZM66.868 62.195a11.025 11.025 0 0 1-3.823.68c-2.719 0-4.249-1.529-4.249-4.5a14.009 14.009 0 0 1 .17-1.785l.34-2.039.255-1.613 2.294-13.936h5.271l-.6 3.059h2.719l-.68 5.013h-2.717l-1.444 8.5a3.192 3.192 0 0 0-.085.85c0 1.02.51 1.445 1.784 1.445a3.534 3.534 0 0 0 1.444-.17l-.679 4.5Zm-20.477-13.68c0 2.55 1.189 4.333 3.993 5.693 2.209 1.02 2.549 1.359 2.549 2.209 0 1.275-.935 1.869-3.059 1.869a15.877 15.877 0 0 1-4.758-.764l-.765 4.672.255.086.935.17a5.582 5.582 0 0 0 1.444.17 19.636 19.636 0 0 0 2.889.17c5.607 0 8.242-2.125 8.242-6.8 0-2.805-1.1-4.42-3.738-5.693-2.294-1.016-2.552-1.27-2.552-2.205 0-1.1.935-1.614 2.634-1.614a33.177 33.177 0 0 1 3.824.255l.764-4.673a30.77 30.77 0 0 0-4.673-.425c-5.948 0-8.072 3.143-7.987 6.881Zm109.1 13.935h-5.014l.256-1.955a6.363 6.363 0 0 1-4.93 2.209c-3.908 0-6.457-3.312-6.457-8.41 0-6.8 3.994-12.576 8.666-12.576a6.107 6.107 0 0 1 5.1 2.8l1.189-7.137h5.268l-4.078 25.065Zm-7.818-4.758c2.465 0 4.164-2.889 4.164-6.883 0-2.634-.936-3.994-2.8-3.994-2.379 0-4.162 2.8-4.162 6.8q0 4.08 2.8 4.079Zm-64.492 4.333a17.408 17.408 0 0 1-5.523.85c-5.948 0-9.007-3.143-9.007-9.176 0-6.967 3.909-12.15 9.262-12.15 4.418 0 7.221 2.889 7.221 7.392a20.537 20.537 0 0 1-.68 5.1H73.92a1.667 1.667 0 0 0-.085.6c0 2.379 1.615 3.568 4.673 3.568a11.688 11.688 0 0 0 5.523-1.275l-.85 5.1Zm-2.974-12.15v-1.019a2.351 2.351 0 0 0-2.549-2.634c-1.7 0-2.889 1.275-3.4 3.653h5.948ZM26.084 62.451h-5.268l3.059-19.288-6.882 19.288h-3.654l-.425-19.118-3.228 19.118H4.758l4.168-25.065h7.647l.253 15.549 5.1-15.549h8.327L26.09 62.451Zm13.17-9.092c-.51 0-.765-.084-1.19-.084-2.974 0-4.5 1.1-4.5 3.143a1.792 1.792 0 0 0 1.869 2.039c2.209 0 3.739-2.039 3.824-5.1Zm3.908 9.092h-4.419l.083-2.125a6.622 6.622 0 0 1-5.608 2.465c-2.889 0-4.843-2.209-4.843-5.523 0-5.012 3.4-7.9 9.346-7.9.6 0 1.36.085 2.209.169a4.283 4.283 0 0 0 .17-1.274c0-1.359-.935-1.869-3.4-1.869a17.526 17.526 0 0 0-4.418.51l-.765.255-.51.085.765-4.588a21.368 21.368 0 0 1 6.373-1.02c4.588 0 7.052 2.039 7.052 5.947a25.7 25.7 0 0 1-.425 4.079l-1.19 7.223-.17 1.273-.085 1.02-.085.766-.083.508Zm80.209-9.092c-.6 0-.85-.084-1.189-.084-3.059 0-4.59 1.1-4.59 3.143a1.854 1.854 0 0 0 1.955 2.039c2.125 0 3.738-2.039 3.824-5.1Zm3.908 9.092h-4.418l.084-2.125a6.618 6.618 0 0 1-5.607 2.465c-2.889 0-4.844-2.209-4.844-5.523 0-5.012 3.4-7.9 9.346-7.9.6 0 1.361.085 2.125.169a5.4 5.4 0 0 0 .256-1.274c0-1.359-.936-1.869-3.4-1.869a18.23 18.23 0 0 0-4.5.51l-.68.255-.51.085.764-4.588a21.372 21.372 0 0 1 6.373-1.02c4.588 0 6.967 2.039 6.967 5.947a18.28 18.28 0 0 1-.424 4.079l-1.1 7.223-.17 1.273-.17 1.02-.084.766v.508Zm14.274-20.562h-.51c-1.783 0-2.8.85-4.418 3.313l.51-3.144h-4.844l-3.229 20.392h5.264c1.955-12.49 2.465-14.614 5.014-14.614h.34a21.359 21.359 0 0 1 2.039-5.863l-.17-.084Z"
                  ></path>
                </g>
              </svg>
            </div>
            <div className="m-2 pt-10 pl-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="160"
                height="110"
                id="payment"
              >
                <g fill="none" fill-rule="evenodd">
                  <path
                    fill="#227FBB"
                    d="M111.999 0H8C3.582 0 0 3.59 0 8.008v59.984C0 72.415 3.591 76 8.001 76H112c4.419 0 8.001-3.59 8.001-8.008V8.008C120 3.585 116.409 0 111.999 0Z"
                  ></path>
                  <path
                    fill="#FFF"
                    d="m10.825 27.31-2.31-5.63-2.297 5.63h4.607Zm50.896-2.242c-.464.282-1.013.291-1.67.291h-4.1v-3.137h4.156c.588 0 1.202.026 1.6.255.439.205.71.643.71 1.248 0 .618-.258 1.114-.696 1.343 0 0 .438-.229 0 0Zm29.253 2.242-2.336-5.63-2.323 5.63h4.659Zm-54.53 6.094h-3.46l-.012-11.061-4.895 11.061h-2.964l-4.907-11.07v11.07h-6.865l-1.297-3.15H5.016l-1.31 3.15H.04l6.044-14.123H11.1l5.741 13.372V19.281h5.51l4.417 9.581 4.057-9.581h5.62v14.123Zm13.792 0H38.96V19.281h11.276v2.94h-7.9v2.547h7.71v2.895h-7.71v2.82h7.9v2.921Zm15.899-10.32c0 2.252-1.503 3.416-2.379 3.765.739.281 1.37.778 1.67 1.19.477.702.559 1.33.559 2.59v2.775H62.58l-.012-1.78c0-.85.081-2.073-.533-2.752-.493-.497-1.245-.605-2.46-.605H55.95v5.137h-3.375V19.281h7.764c1.725 0 2.996.045 4.087.676 1.068.631 1.708 1.552 1.708 3.128 0 0 0-1.576 0 0Zm5.402 10.32h-3.445V19.281h3.445v14.123Zm39.956 0h-4.783l-6.398-10.6v10.6h-6.874l-1.314-3.15h-7.012l-1.274 3.15h-3.95c-1.64 0-3.718-.363-4.894-1.562-1.187-1.199-1.804-2.823-1.804-5.392 0-2.094.369-4.01 1.82-5.522 1.091-1.128 2.8-1.647 5.126-1.647h3.268v3.026h-3.2c-1.231 0-1.927.183-2.597.837-.575.594-.97 1.719-.97 3.199 0 1.513.3 2.604.928 3.317.52.559 1.464.728 2.352.728h1.516l4.758-11.107h5.057l5.715 13.36V19.28h5.14l5.933 9.837V19.28h3.457v14.123ZM0 36.18h5.768l1.3-3.138H9.98l1.297 3.138h11.348V33.78l1.013 2.409h5.89l1.013-2.445v2.435h28.201l-.013-5.15h.545c.382.013.494.049.494.68v4.47h14.586v-1.2c1.176.631 3.006 1.2 5.414 1.2h6.136l1.313-3.138h2.911l1.284 3.138h11.825v-2.98l1.79 2.98h9.476V16.48h-9.377v2.327l-1.314-2.327H94.19v2.327l-1.206-2.327H79.986c-2.176 0-4.089.304-5.633 1.15v-1.15h-8.97v1.15c-.983-.872-2.323-1.15-3.812-1.15H28.802l-2.199 5.088-2.258-5.088h-10.32v2.327L12.89 16.48H4.088L0 25.846v10.333Zm120.063 10.4h-6.152c-.614 0-1.022.023-1.366.255-.356.229-.493.568-.493 1.017 0 .533.3.895.738 1.052.356.124.739.16 1.301.16l1.83.049c1.845.046 3.078.363 3.83 1.137.136.108.218.229.312.35v-4.02Zm0 9.314c-.82 1.199-2.417 1.807-4.58 1.807h-6.519v-3.03h6.492c.644 0 1.095-.084 1.366-.35.235-.218.4-.535.4-.92 0-.412-.165-.739-.413-.935-.245-.215-.601-.313-1.19-.313-3.169-.108-7.123.098-7.123-4.373 0-2.049 1.301-4.206 4.843-4.206h6.724v-2.81h-6.247c-1.885 0-3.255.45-4.225 1.153v-1.154h-9.24c-1.477 0-3.212.367-4.032 1.154v-1.154h-16.5v1.154c-1.313-.947-3.529-1.154-4.552-1.154H64.384v1.154c-1.039-1.006-3.35-1.154-4.757-1.154H47.446l-2.787 3.017-2.611-3.017H23.853v19.712h17.853l2.872-3.064 2.705 3.064 11.005.01v-4.637h1.082c1.46.023 3.182-.036 4.701-.693v5.32h9.077v-5.138h.438c.559 0 .614.023.614.582v4.556h27.573c1.75 0 3.58-.449 4.594-1.262v1.262h8.746c1.82 0 3.598-.256 4.95-.91v-3.671ZM106.6 50.249c.657.68 1.01 1.54 1.01 2.993 0 3.04-1.9 4.458-5.303 4.458H95.73v-3.03h6.548c.64 0 1.095-.084 1.38-.35.231-.218.398-.535.398-.92 0-.412-.18-.739-.412-.935-.258-.215-.614-.313-1.202-.313-3.157-.108-7.11.098-7.11-4.373 0-2.049 1.287-4.206 4.826-4.206h6.767v3.007h-6.192c-.614 0-1.013.023-1.352.255-.37.229-.507.568-.507 1.016 0 .533.314.896.738 1.053.356.124.739.16 1.314.16l1.817.049c1.832.045 3.09.362 3.855 1.136 0 0-.765-.774 0 0Zm-30.458-.872c-.452.268-1.01.29-1.667.29h-4.1v-3.172h4.156c.6 0 1.202.012 1.61.255.438.229.7.666.7 1.27 0 .605-.262 1.092-.7 1.357 0 0 .438-.265 0 0Zm2.038 1.758c.752.277 1.366.774 1.654 1.186.476.69.545 1.333.559 2.578v2.8h-3.389v-1.767c0-.85.082-2.108-.545-2.765-.494-.506-1.245-.627-2.477-.627h-3.607v5.16h-3.392V43.573h7.793c1.709 0 2.954.075 4.061.666 1.066.644 1.736 1.526 1.736 3.137 0 2.255-1.504 3.406-2.393 3.759 0 0 .889-.353 0 0Zm4.264-7.562H93.71v2.921h-7.904v2.569h7.711v2.882h-7.711v2.81l7.904.013V57.7H82.443V43.573Zm-22.773 6.52h-4.363v-3.598h4.402c1.218 0 2.064.496 2.064 1.732 0 1.222-.806 1.865-2.103 1.865Zm-7.724 6.322-5.183-5.754 5.183-5.572v11.326Zm-13.384-1.66h-8.299v-2.81h7.41v-2.882h-7.41v-2.569h8.463l3.692 4.117-3.856 4.145Zm26.835-6.528c0 3.924-2.927 4.734-5.878 4.734h-4.212V57.7h-6.56l-4.157-4.677-4.32 4.677H26.9V43.573h13.577l4.153 4.63 4.293-4.63H59.71c2.678 0 5.688.741 5.688 4.654 0 0 0-3.913 0 0Z"
                  ></path>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
