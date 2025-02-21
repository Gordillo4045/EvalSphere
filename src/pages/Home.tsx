import { MarqueeReview } from "@/components/MarqueeReview";
import { useTheme } from "@/components/ThemeProvider";
import BlurIn from "@/components/ui/blur-in";
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import PricingSection from "@/components/PricingSection";
import { Accordion, AccordionItem } from "@heroui/react";
import BlurFade from "@/components/ui/blur-fade";
import { BenefitsSection } from "@/components/blocks/Benefits";
import { FeatureSteps } from "@/components/blocks/objective-section";

const accordion1 =
  "Una evaluación de desempeño 360° es un proceso de retroalimentación en el que un empleado recibe evaluaciones de múltiples fuentes, incluyendo supervisores, compañeros de trabajo, subordinados y, a veces, clientes. El objetivo es obtener una visión integral del desempeño del empleado desde diferentes perspectivas. A menudo incluye una autoevaluación por parte del empleado.";
const accordion2 =
  "La evaluación 360° proporciona a los empleados una retroalimentación más completa y detallada, lo que les permite identificar áreas de mejora y fortalezas. Para la organización, es una herramienta valiosa para desarrollar el talento, mejorar la comunicación interna y fortalecer la cultura de retroalimentación. También puede mejorar la autoconciencia de los empleados, fomentando el crecimiento y el desarrollo profesional.";
const accordion3 =
  "La confidencialidad es clave para garantizar que los participantes brinden retroalimentación honesta y constructiva. Por lo general, los comentarios se recopilan de forma anónima, especialmente cuando provienen de compañeros y subordinados. Los resultados se presentan de manera agregada para proteger la identidad de los evaluadores, lo que aumenta la confianza en el proceso y fomenta una mayor participación.";

const features = [
  {
    step: 'Objetivo 1',
    title: 'Medir el rendimiento de los empleados',
    image: 'https://images.unsplash.com/photo-1576267423429-569309b31e84?q=80&w=2970&auto=format&fit=crop'
  },
  {
    step: 'Objetivo 2',
    title: 'Evaluar las competencias',
    image: 'https://plus.unsplash.com/premium_photo-1679547203037-6792f7fce8fb?w=800&auto=format&fit=crop'
  },
  {
    step: 'Objetivo 3',
    title: 'Diseñar programas de aprendizaje y desarrollo',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2970&auto=format&fit=crop'
  },
  {
    step: 'Objetivo 4',
    title: 'Implementar planes de carrera y sucesión',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop'
  },
]


export default function Home() {
  useTheme();
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-0">
      <div className=" h-dvh">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={1.1}
          duration={1}
          repeatDelay={4}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-45%] h-[200%] skew-y-12"
          )}
        />
        <div className="flex flex-col items-center justify-center h-full text-center">
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
        </div>
      </div>

      <FeatureSteps
        features={features}
        title="Objetivos de la evaluación 360°"
        autoPlayInterval={3000}
      />
      <BenefitsSection />
      <PricingSection />
      <div className="">
        <section id="header" className="text-center">
          <BlurFade delay={0.25} inView>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl ">
              Testimonios
            </h2>
          </BlurFade>
          <p className="text-neutral-500 text-lg text-pretty whitespace-pre-line dark:text-neutral-400">
            Lo que dicen nuestros clientes sobre nuestra plataforma.
          </p>
        </section>
        <MarqueeReview />
      </div>

      <div className="max-w-4xl mx-auto mb-20">
        <section id="header" className="text-center">
          <BlurFade delay={0.25} inView>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl ">
              Preguntas Frecuentes
            </h2>
          </BlurFade>
          <p className="text-neutral-500 text-lg text-pretty whitespace-pre-line dark:text-neutral-400">
            Preguntas frecuentes sobre la
            evaluación de desempeño 360°.
          </p>
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
  );
}
