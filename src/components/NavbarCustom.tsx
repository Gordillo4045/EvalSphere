import { useState } from "react";
import { Navbar, NavbarContent, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Spinner, Button, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Image } from "@nextui-org/react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import LoginForm from "@/components/LoginForm";
import { signOut } from "firebase/auth";
import { auth } from "@/config/config";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { MdOutlineLogin, MdOutlineLogout } from "react-icons/md";
import { FaUsersGear } from "react-icons/fa6";
import EmployeeSignUpForm from "@/components/company/EmployeeSignUpForm";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CompanySignUpForm from "./company/CompanySignUpForm";


export default function NavbarCustom() {
    const { setTheme, theme } = useTheme();
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { user, isAdmin, isCompany, loading } = useAuth();
    const [isEmployeeSignUpOpen, setIsEmployeeSignUpOpen] = useState(false);
    const [isCompanySignUpOpen, setIsCompanySignUpOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isEmployee } = useAuth();

    const handleEmployeeSignUp = () => {
        setIsEmployeeSignUpOpen(true);
    };
    const handleCompanySignUp = () => {
        setIsCompanySignUpOpen(true);
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
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
                    menu: "mx-auto mt-3 max-h-[40vh] max-w-[80vw] rounded-large border-small border-default-200/20 bg-background/60 py-6 shadow-medium backdrop-blur-sm backdrop-saturate-150 dark:bg-default-100/50",
                }}
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
            >


                <NavbarContent
                    justify="center"
                    className=" gap-4 py-2 rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-sm backdrop-saturate-150 dark:bg-default-100/50"
                >

                    <NavbarMenuToggle className="md:hidden pl-2 h-8 w-8" />

                    <Link className="font-bold text-inherit text-2xl" href="/">
                        <Image width="50" src="/img/Logo.png" alt="Logo Evalsphere" />
                    </Link>

                    {user && (
                        <>
                            {isEmployee && (
                                <div className="hidden md:flex items-center justify-center mx-48">
                                    <Link href="/employee/formulario" color="foreground" >Formulario</Link>
                                </div>
                            )}
                            <Dropdown placement="bottom-end" >
                                <DropdownTrigger>
                                    <Avatar
                                        isBordered
                                        as="button"
                                        className={`transition-transform ml-32 ${isEmployee ? 'md:ml-0' : 'md:ml-80'}`}
                                        name={user.displayName || "Usuario"}
                                        size="md"
                                        src={user.photoURL || "https://i.pravatar.cc/150"}
                                        showFallback
                                    />
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Acciones de perfil" variant="flat" >
                                    <DropdownItem key="profile" textValue="perfil" className="h-14 gap-2">
                                        <p className="font-semibold">{user.displayName}</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </DropdownItem>
                                    <DropdownItem key="theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} textValue='tema' startContent={<ThemeToggle />} className="pl-2 ">
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
                        </>
                    )}
                </NavbarContent>

                {!user && (
                    <NavbarContent
                        justify="center"
                        className=" gap-4 py-2 rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
                    >
                        <div className="flex items-center justify-center gap-2 h-8 w-8 md:h-fit md:w-fit">
                            <Button
                                variant="light"
                                onClick={() => setIsLoginOpen(true)}
                                startContent={<MdOutlineLogin />}
                                className="hidden md:flex "
                                size="md"
                            >
                                Iniciar Sesión
                            </Button>
                            <Dropdown placement="bottom-end" offset={12}>
                                <DropdownTrigger>
                                    <Button
                                        variant="light"
                                        startContent={<FaUserPlus />}
                                        className="hidden md:flex "
                                        size="md"
                                    >
                                        Registrarse
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Opciones de registro" variant="flat">
                                    <DropdownItem key="employee" onClick={handleEmployeeSignUp}>
                                        Como Empleado
                                    </DropdownItem>
                                    <DropdownItem key="company" onClick={handleCompanySignUp}>
                                        Como Compañía
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Button isIconOnly variant="solid" className="bg-transparent md:h-7 md:w-7" onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                                <ThemeToggle />
                            </Button>
                        </div>
                    </NavbarContent>
                )}
                <NavbarMenu>
                    {!user ? (
                        <NavbarMenuItem>
                            <Button
                                as={Link}
                                href="#"
                                variant="light"
                                onPress={() => setIsLoginOpen(true)}
                                startContent={<MdOutlineLogin size={15} />}
                                className="p-0 w-full flex justify-start"
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                as={Link}
                                href="#"
                                variant="light"
                                onPress={() => setIsEmployeeSignUpOpen(true)}
                                startContent={<FaUserPlus size={15} />}
                                className="p-0 w-full flex justify-start"
                            >
                                Registrarse como Empleado
                            </Button>
                            <Button
                                as={Link}
                                href="#"
                                variant="light"
                                onPress={() => setIsCompanySignUpOpen(true)}
                                startContent={<FaUserPlus size={15} />}
                                className="p-0 w-full flex justify-start"
                            >
                                Registrarse como Compañía
                            </Button>
                        </NavbarMenuItem>
                    ) : (
                        <NavbarMenuItem>
                            <Link href="/employee/formulario" color="foreground">Formulario</Link>
                        </NavbarMenuItem>
                    )}
                </NavbarMenu>

                <LoginForm isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

                <EmployeeSignUpForm
                    isOpen={isEmployeeSignUpOpen}
                    onClose={() => setIsEmployeeSignUpOpen(false)}
                />

                <CompanySignUpForm
                    isOpen={isCompanySignUpOpen}
                    onClose={() => setIsCompanySignUpOpen(false)}
                />
            </Navbar >

        </>
    );
}
