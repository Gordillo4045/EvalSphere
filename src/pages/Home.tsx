import { BentoHome } from "@/components/BentoHome";
import { MarqueeReview } from "@/components/MarqueeReview";
import { useTheme } from "@/components/ThemeProvider";
import BlurIn from "@/components/ui/blur-in";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { MagicCard } from "@/components/ui/magic-card";
import { Image } from "@nextui-org/react";

export default function Home() {
    const { theme } = useTheme()
    return (
        <div className="max-w-5xl mx-auto p-2 md:p-0">

            <div className="flex flex-col overflow-hidden">
                <ContainerScroll
                    titleComponent={
                        <>
                            <BlurIn
                                word="texto"
                                className="text-4xl font-semibold text-black dark:text-white"
                                duration={1.5}
                                variant={{
                                    hidden: { filter: "blur(15px)", opacity: 0 },
                                    visible: { filter: "blur(0px)", opacity: 1 }
                                }} />
                            <br />
                            <BlurIn
                                word="Frace chila"
                                className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-black dark:text-white"
                                duration={1.5}
                                variant={{
                                    hidden: { filter: "blur(15px)", opacity: 0 },
                                    visible: { filter: "blur(0px)", opacity: 1 }
                                }} />
                        </>
                    }
                >

                    <div className="w-full h-full overflow-hidden">
                        <Image
                            src={`https://nextui.org/images/card-example-5.jpeg`}
                            alt="hero"
                            width={1500}
                            className="w-full h-full object-cover"
                            isZoomed
                        />
                    </div>
                </ContainerScroll>
            </div>
            <div className="-translate-y-[20%] md:-translate-y-40">
                <BentoHome />
                <MarqueeReview />
                <div className=" flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row">
                    <MagicCard
                        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                        className="cursor-pointer w-full flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
                    >
                        as
                    </MagicCard>
                </div>
            </div>
        </div>
    )
}