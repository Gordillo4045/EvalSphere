import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";

const reviews = [
    {
        name: "Laura S.",
        username: "@LauraS",
        body: "Súper útil para nuestras evaluaciones 360. Muy intuitivo.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Carlos M.",
        username: "@CarlosM",
        body: "La personalización es excelente. ¡Recomendado!",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "Andrea T.",
        username: "@AndreaT",
        body: "Soporte rápido y resultados claros.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Juan R.",
        username: "@juanR",
        body: "Ideal para mejorar el feedback en el equipo.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Mónica G.",
        username: "@monicaG",
        body: "La mejor plataforma de evaluación que hemos probado.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "Alejandro P.",
        username: "@AlejandroP",
        body: "Funcional y fácil de usar. Excelente inversión.",
        img: "https://avatar.vercel.sh/james",
    },
    {
        name: "Sofía C.",
        username: "@SofiaC",
        body: "Los informes detallados hacen toda la diferencia.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Luis F.",
        username: "@LuisF",
        body: "¡Nos facilitó todo el proceso de evaluación!",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "Mariana D.",
        username: "@MarianaD",
        body: "Excelente relación calidad-precio.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Gabriel L.",
        username: "@GabrielL",
        body: "La mejor herramienta para gestionar feedback.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Paola R.",
        username: "@PaolaR",
        body: "Fácil de configurar y de usar.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "Fernando C.",
        username: "@FernandoC",
        body: "Ahorra mucho tiempo en nuestras evaluaciones.",
        img: "https://avatar.vercel.sh/james",
    },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full" width="32" height="32" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{body}</blockquote>
        </figure>
    );
};

export function MarqueeReview() {
    return (
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
            <Marquee pauseOnHover className="[--duration:20s]">
                {firstRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRow.map((review) => (
                    <ReviewCard key={review.username} {...review} />
                ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
    );
}
