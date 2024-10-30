import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { BorderBeam } from "./border-beam";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div
            className="w-full h-[120vh] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 -translate-y-40 md:translate-y-0"
            ref={containerRef}
        >
            <div
                className="py-10 md:pb-40 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }: any) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className="div w-full mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
            }}
            className="-mt-12 mx-auto h-fit md:h-fit w-full overflow-hidden rounded-[30px] relative shadow-lg"
        >
            <div className="h-fit w-full bg-gray-100 dark:bg-zinc-900">
                {children}
            </div>
            <BorderBeam
                size={250}
                delay={20}
                className="absolute inset-0 z-50 rounded-[30px]"
                colorFrom="#ffffff"
                colorTo="#ffffff"
            />
        </motion.div>
    );
};
