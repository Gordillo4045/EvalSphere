import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { CheckIcon } from "@radix-ui/react-icons";
import { Link } from "@heroui/react";
import useMediaQuery from "@/hooks/useMediaQuery";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Precios Simples y Transparentes",
  description = "Elige el plan que funcione para ti\nTodos los planes incluyen acceso a nuestra plataforma y soporte.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);

  };

  return (
    <div className="container py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
      >
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="text-neutral-500 text-lg whitespace-pre-line dark:text-neutral-400">
            {description}
          </p>
        </div>
      </motion.div>
      <div className="flex justify-center mb-10">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold">
          Pago anual <span className="text-neutral-900 dark:text-neutral-50">(Ahorra 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 sm:2 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                  y: plan.isPopular ? -20 : 0,
                  opacity: 1,
                  x: index === 2 ? -30 : index === 0 ? 30 : 0,
                  scale: index === 0 || index === 2 ? 0.94 : 1.0,
                }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 bg-background text-center lg:flex lg:flex-col lg:justify-center relative mx-2 md:mx-0`,
              plan.isPopular ? "border-neutral-900 border-2 dark:border-neutral-50" : "border-neutral-200 dark:border-neutral-800",
              "flex flex-col",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-neutral-900 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center dark:bg-neutral-50">
                <Star className="text-neutral-50 h-4 w-4 fill-current dark:text-neutral-900" />
                <span className="text-neutral-50 ml-1 font-sans font-semibold dark:text-neutral-900">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-neutral-500 dark:text-neutral-400">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      currencyDisplay: "symbol",
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-neutral-500 dark:text-neutral-400">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                {isMonthly ? "facturado mensualmente" : "facturado anualmente"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-neutral-900 mt-1 flex-shrink-0 dark:text-neutral-50" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-neutral-900 hover:ring-offset-1 hover:bg-neutral-900 hover:text-neutral-50 dark:hover:ring-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-900",
                  plan.isPopular
                    ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
                    : "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-6 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
