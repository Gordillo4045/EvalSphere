import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { InputIcon, CodeIcon, LockClosedIcon, ImageIcon } from "@radix-ui/react-icons";


const features = [
    {
        Icon: CodeIcon,
        name: "Algoritmos de IA avanzados",
        description: "Nuestra plataforma utiliza algoritmos de IA de vanguardia para proporcionar soluciones precisas y eficientes para las necesidades de tu negocio.",
        href: "/",
        cta: "Saber más",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-span-2 lg:row-span-2",
    },
    {
        Icon: LockClosedIcon,
        name: "Manejo seguro de datos",
        description: "Priorizamos la seguridad de tus datos con encriptación de última generación y estrictos protocolos de privacidad, asegurando que tu información permanezca confidencial.",
        href: "/",
        cta: "Saber más",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-span-2 lg:row-span-2",
    },
    {
        Icon: ImageIcon,
        name: "Integración perfecta",
        description: "Integra fácilmente nuestras soluciones de IA en tus flujos de trabajo y sistemas existentes para una operación fluida y eficiente.",
        href: "/",
        cta: "Saber más",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-span-2 lg:row-span-3",
    },
    {
        Icon: InputIcon,
        name: "Soluciones personalizables",
        description: "Adapta nuestros servicios de IA a tus necesidades específicas con opciones de personalización flexibles, permitiéndote obtener el máximo provecho de nuestra plataforma.",
        href: "/",
        cta: "Saber más",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-span-4 lg:row-span-1",
    },
];

export function BentoHome() {
    return (
        <BentoGrid className="lg:grid-cols-6 lg:grid-rows-3 gap-4 mb-5">
            {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
            ))}
        </BentoGrid>
    );
}
