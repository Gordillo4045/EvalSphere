import { useState } from "react";
import { Navbar, NavbarContent, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Spinner, Button, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@nextui-org/react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import LoginForm from "./LoginForm";
import { signOut } from "firebase/auth";
import { auth } from "../config/config";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { MdOutlineLogin, MdOutlineLogout } from "react-icons/md";
import { FaUsersGear } from "react-icons/fa6";
import EmployeeSignUpForm from "./company/EmployeeSignUpForm";
import { FaUserPlus } from "react-icons/fa";

export default function NavbarCustom() {
    const { toggleTheme } = useTheme();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { user, isAdmin, isCompany, loading } = useAuth();
    const [isEmployeeSignUpOpen, setIsEmployeeSignUpOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleEmployeeSignUp = () => {
        setIsEmployeeSignUpOpen(true);
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Sesión cerrada exitosamente");
        } catch (error) {
            toast.error("Error al cerrar sesión");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <Spinner color="primary" label="Cargando..." />
        </div>;
    }
    return (
        <>
            <Navbar
                shouldHideOnScroll
                isBlurred={false}
                className="bg-transparent py-2"
                classNames={{
                    wrapper: "px-0 w-full justify-center bg-transparent h-fit",
                    menu: "mx-auto mt-1 max-h-[40vh] max-w-[80vw] rounded-large border-small border-default-200/20 bg-background/60 py-6 shadow-medium backdrop-blur-sm backdrop-saturate-150 dark:bg-default-100/50",
                }}
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
            >


                <NavbarContent
                    justify="center"
                    className=" gap-4 py-2 rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-sm backdrop-saturate-150 dark:bg-default-100/50"
                >

                    <NavbarMenuToggle className="md:hidden pl-2 h-8 w-8" />

                    <Link className=" text-inherit text-xl font-bold md:mx-2" href="/">EvalSphere</Link>

                    {user && (
                        <Dropdown placement="bottom-end" >
                            <DropdownTrigger>
                                <Avatar
                                    isBordered
                                    as="button"
                                    className="transition-transform ml-32 md:ml-96"
                                    color="secondary"
                                    name={user.displayName || "Usuario"}
                                    size="sm"
                                    src={user.photoURL || "https://i.pravatar.cc/150"}

                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acciones de perfil" variant="flat" >
                                <DropdownItem key="profile" textValue="perfil" className="h-14 gap-2">
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="font-semibold">{user.email}</p>
                                </DropdownItem>
                                <DropdownItem key="theme" onClick={toggleTheme} textValue='tema' startContent={<ThemeToggle />} className="pl-2 ">
                                    Tema
                                </DropdownItem>
                                {isAdmin && (
                                    <DropdownItem key="controlpanel" href="/controlpanel" startContent={<FaUsersGear />} textValue="panel de control">
                                        Panel de Control Admin
                                    </DropdownItem>
                                )}
                                {isCompany && (
                                    <DropdownItem key="controlpanel" href="/company/controlpanel" startContent={<FaUsersGear />} textValue="panel de control">
                                        Panel de Control Compañía
                                    </DropdownItem>
                                )}
                                <DropdownItem key="logout" color="danger" onClick={handleLogout} startContent={<MdOutlineLogout />} textValue="cerrar sesión">
                                    Cerrar Sesión
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </NavbarContent>

                {!user && (
                    <NavbarContent
                        justify="center"
                        className=" gap-4 py-2 rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
                    >
                        <div className="flex items-center justify-center gap-2 h-8 w-8 md:h-fit md:w-fit">
                            <Button
                                color="primary"
                                variant="light"
                                onClick={() => setIsLoginOpen(true)}
                                startContent={<MdOutlineLogin />}
                                className="hidden md:flex h-7"
                                size="sm"
                            >
                                Iniciar Sesión
                            </Button>
                            <Dropdown placement="bottom-end" offset={12}>
                                <DropdownTrigger>
                                    <Button
                                        color="secondary"
                                        variant="light"
                                        startContent={<FaUserPlus />}
                                        className="hidden md:flex h-7"
                                        size="sm"
                                    >
                                        Registrarse
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Opciones de registro" variant="flat">
                                    <DropdownItem key="employee" onClick={handleEmployeeSignUp}>
                                        Como Empleado
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Button isIconOnly variant="solid" className="bg-transparent md:h-7 md:w-7" onPress={toggleTheme}>
                                <ThemeToggle />
                            </Button>
                        </div>
                    </NavbarContent>
                )}
                <NavbarMenu>
                    <NavbarMenuItem>
                        <Link href="/">
                            Inicio
                        </Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <Button
                            as={Link}
                            href="#"
                            variant="light"
                            onPress={() => setIsLoginOpen(true)}
                            startContent={<MdOutlineLogin />}
                        >
                            Iniciar Sesión
                        </Button>
                    </NavbarMenuItem>
                </NavbarMenu>

                <LoginForm isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

                <EmployeeSignUpForm
                    isOpen={isEmployeeSignUpOpen}
                    onClose={() => setIsEmployeeSignUpOpen(false)}
                />
            </Navbar >

        </>
    );
}
