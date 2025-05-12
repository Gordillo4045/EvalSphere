import { Accordion, AccordionItem, Button, Divider, Kbd, Link, Popover, PopoverContent, PopoverTrigger, Tooltip, User } from "@heroui/react"
import { motion, useAnimationControls } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import ThemeToggleSlide from "@/components/ThemeToggleSlide"
import type { Selection } from "@heroui/react";
import { AiFillSetting } from "react-icons/ai";
import { signOut } from "firebase/auth"
import { toast } from "sonner"
import { auth } from "@/config/config";
import { MdGroupWork, MdOutlineHistory, MdOutlineLogout } from "react-icons/md"
import { IoMdHome } from "react-icons/io";
import { FaClipboardQuestion, FaUsers } from "react-icons/fa6"
import { BsPersonBadgeFill } from "react-icons/bs"
import { FaQuestionCircle } from "react-icons/fa"
import { useHotkeys } from "react-hotkeys-hook"

const isMobile = window.innerWidth <= 768;

const containerVariants = {
    close: {
        width: isMobile ? "3.5rem" : "5rem",
        transition: {
            type: "spring",
            damping: 15,
            duration: 0.5,
        },
    },
    open: {
        width: isMobile ? "13rem" : "16rem",
        transition: {
            type: "spring",
            damping: 15,
            duration: 0.5,
        },
    },
}

const svgVariants = {
    close: {
        rotate: 360,
    },
    open: {
        rotate: 180,
    },
}

interface Props {
    setActiveTab: (tab: string) => void;
}

const Sidebar = ({ setActiveTab }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [openTooltip, setOpenTooltip] = useState<string | null>(null)
    const { user } = useAuth();
    const containerControls = useAnimationControls()
    const svgControls = useAnimationControls()
    const [selectedKeys, setSelectedKeys] = useState<Selection>()
    const sidebarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            containerControls.start("open")
            svgControls.start("open")
        } else {
            containerControls.start("close")
            svgControls.start("close")
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSelectedKeys(new Set(['0']))
            }
        }
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setOpenTooltip(null)
        }
    }, [isOpen])

    const handleOpenClose = () => {
        setSelectedKeys(new Set(['0']))
        setIsOpen(!isOpen)
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Sesión cerrada exitosamente");
        } catch (error) {
            toast.error("Error al cerrar sesión");
        }
    }

    useHotkeys(["meta+b", "ctrl+b"], (event) => {
        event.preventDefault()
        handleOpenClose()
    }, {
        enableOnFormTags: true,
        preventDefault: true
    })

    return (
        <>
            <motion.nav
                ref={sidebarRef}
                variants={containerVariants}
                animate={containerControls}
                initial="close"
                className="fixed flex flex-col rounded-r-md z-50 gap-20 p-2 md:p-5 top-15  left-0 h-dvh shadow backdrop-blur-sm backdrop-saturate-150 border-r border-gray-300 dark:border-gray-700/50"
            >
                <div className="flex flex-row w-full justify-between place-items-center">
                    <div className="relative group">
                        {isOpen && (
                            <Popover showArrow>
                                <PopoverTrigger>
                                    <User
                                        as="button"
                                        name={user.displayName || "Usuario"}
                                        description={
                                            <span className="truncate max-w-[150px] hidden md:block">
                                                {user.email}
                                            </span>
                                        }
                                        avatarProps={{ src: user.photoURL || "https://i.pravatar.cc/150", size: isMobile ? "sm" : "md", showFallback: true }}
                                        classNames={{
                                            wrapper: "max-w-[120px] md:max-w-[150px]",
                                            description: "text-xs",
                                        }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="p-4 w-[280px]">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <User
                                                name={user.displayName || "Usuario"}
                                                description={user.email}
                                                avatarProps={{
                                                    src: user.photoURL || "https://i.pravatar.cc/150",
                                                    size: "lg",
                                                    showFallback: true,
                                                    className: "ring-2 ring-primary/30"
                                                }}
                                            />
                                        </div>
                                        <Divider />
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-warning/10 dark:bg-warning/20 p-2 rounded-full">
                                                    <FaQuestionCircle size={18} className="text-warning" />
                                                </div>
                                                <Link onPress={() => { setActiveTab('support'); }} color="foreground" isBlock className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer w-full">
                                                    Centro de ayuda
                                                </Link>
                                            </div>
                                        </div>
                                        <Divider />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs text-gray-500">
                                                Última sesión: {new Date().toLocaleDateString()}
                                            </p>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                onPress={handleLogout}
                                                startContent={<MdOutlineLogout size={18} />}
                                                className="w-full justify-start"
                                            >
                                                Cerrar sesión
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                    </div>


                    <Tooltip
                        placement="right"
                        content={<span className="flex items-center gap-1">Abrir/Cerrar <Kbd keys={["command"]}>B</Kbd></span>}
                    >
                        <button
                            className="p-1 rounded-full flex mt-2 sm:mt-0"
                            onClick={() => handleOpenClose()}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1}
                                stroke="currentColor"
                                className="size-6 -ml-1 md:ml-0 md:size-8"
                            >
                                <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    variants={svgVariants}
                                    animate={svgControls}
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                    transition={{
                                        duration: 0.5,
                                        ease: "easeInOut",
                                    }}
                                />
                            </svg>
                        </button>
                    </Tooltip>
                </div>
                <div className="flex flex-col flex-grow basis-0 gap-3">
                    <Tooltip
                        content="Inicio"
                        placement="right"
                        isOpen={openTooltip === 'home' && !isOpen}
                        onOpenChange={(open) => setOpenTooltip(open ? 'home' : null)}
                    >
                        <Link
                            onPress={() => { setActiveTab('home'); }}
                            className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                            color="foreground"
                            isBlock
                        >
                            {isOpen ? <>
                                <IoMdHome size={25} />
                                Inicio
                            </> : (<IoMdHome size={30} />)}
                        </Link>
                    </Tooltip>
                    <Tooltip content="Historial" placement="right" isOpen={openTooltip === 'evaluationHistory' && !isOpen}
                        onOpenChange={(open) => setOpenTooltip(open ? 'evaluationHistory' : null)}>
                        <Link
                            onPress={() => { setActiveTab('evaluationHistory'); }}
                            className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                            color="foreground"
                            isBlock
                        >
                            {isOpen ? <>
                                <MdOutlineHistory size={25} />
                                Historial
                            </> : (<MdOutlineHistory size={30} />)}
                        </Link>
                    </Tooltip>
                    <Tooltip content="Configuracion" placement="right" isOpen={openTooltip === 'config' && !isOpen}
                        onOpenChange={(open) => setOpenTooltip(open ? 'config' : null)}>
                        <Accordion
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            itemClasses={{
                                title: "font-normal text-medium",
                            }}
                        >
                            <AccordionItem
                                key="1"
                                aria-label="Accordion 1"
                                title={isOpen ? "Configuracion" : ""}
                                startContent={<AiFillSetting size={25} />}
                                hideIndicator={isOpen ? false : true}
                                onPress={() => setIsOpen(true)}
                            >
                                <Link
                                    onPress={() => { setActiveTab('employees'); }}
                                    className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                                    color="foreground"
                                    isBlock
                                >
                                    {isOpen ? <>
                                        <FaUsers size={25} />
                                        Empleados
                                    </> : (<FaUsers size={30} />)}
                                </Link>
                                <Link
                                    onPress={() => { setActiveTab('departments'); }}
                                    className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                                    color="foreground"
                                    isBlock
                                >
                                    {isOpen ? <>
                                        <MdGroupWork size={25} />
                                        <span className="truncate ">Departamentos</span>
                                    </> : (<MdGroupWork size={30} />)}
                                </Link>
                                <Link
                                    onPress={() => { setActiveTab('positions'); }}
                                    className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                                    color="foreground"
                                    isBlock
                                >
                                    {isOpen ? <>
                                        <BsPersonBadgeFill size={25} />
                                        Puestos
                                    </> : (<BsPersonBadgeFill size={30} />)}
                                </Link>
                                <Link
                                    onPress={() => { setActiveTab('surveyQuestions'); }}
                                    className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                                    color="foreground"
                                    isBlock
                                >
                                    {isOpen ? <>
                                        <FaClipboardQuestion size={25} />
                                        Preguntas
                                    </> : (<FaClipboardQuestion size={30} />)}
                                </Link>
                            </AccordionItem>
                        </Accordion>
                    </Tooltip>
                    <Tooltip content="Soporte" placement="right" isOpen={openTooltip === 'support' && !isOpen}
                        onOpenChange={(open) => setOpenTooltip(open ? 'support' : null)}>
                        <Link
                            onPress={() => { setActiveTab('support'); }}
                            className="overflow-clip whitespace-nowrap tracking-wide flex gap-3 cursor-pointer"
                            color="foreground"
                            isBlock
                        >
                            {isOpen ? <>
                                <FaQuestionCircle size={25} />
                                Soporte
                            </> : (<FaQuestionCircle size={25} />)}
                        </Link>
                    </Tooltip>
                </div>
                <div className="flex flex-col  gap-3">
                    <ThemeToggleSlide isOpen={isOpen} />
                    <Tooltip content="Cerrar Sesión" placement="right" isOpen={openTooltip === 'logout' && !isOpen}
                        onOpenChange={(open) => setOpenTooltip(open ? 'logout' : null)}>
                        <Button
                            isIconOnly={isOpen ? false : true}
                            variant="light"
                            color="danger"
                            onPress={handleLogout}
                            startContent={<MdOutlineLogout size={25} />}
                            className={`${isOpen ? 'flex justify-start transition-all' : 'ml-1 transition-all'}`}
                            size="sm">
                            {isOpen && (<span className="font-normal text-medium">Cerrar Sesión</span>)}
                        </Button>
                    </Tooltip>
                </div>

            </motion.nav>

        </>
    )
}

export default Sidebar
