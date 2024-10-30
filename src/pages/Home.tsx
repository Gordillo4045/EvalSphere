import { MarqueeReview } from "@/components/MarqueeReview";
import { useTheme } from "@/components/ThemeProvider";
import BlurIn from "@/components/ui/blur-in";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import PricingSection from "@/components/PricingSection";
import { Accordion, AccordionItem } from "@nextui-org/react";
import BlurFade from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";

const accordion1 = "This";
const accordion2 = "is";
const accordion3 = "the default.";

export default function Home() {
  useTheme();
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-0">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={1}
        repeatDelay={1}
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
                className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-9xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
                duration={1.5}
                variant={{
                  hidden: { filter: "blur(15px)", opacity: 0 },
                  visible: { filter: "blur(0px)", opacity: 1 },
                }}
              />
              <br />
              <BlurIn
                word="Evaluación de desempeño 360°"
                className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-5xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
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
      <MagicCard/>

      <div className="flex flex-col gap-2 -translate-y-[25%] md:-translate-y-[20%]">
        <div>
          
        </div>
        <MarqueeReview />

        <div className="pr-28 pl-28 pb-28">
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
            <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1">
              {accordion1}
            </AccordionItem>
            <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
              {accordion2}
            </AccordionItem>
            <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">
              {accordion3}
            </AccordionItem>
          </Accordion>
        </div>
        <PricingSection />
      </div>
    </div>
  );
}
