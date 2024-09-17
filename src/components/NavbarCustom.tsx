import { useState } from "react";
import { Navbar, NavbarBrand, NavbarContent, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Button, NavbarItem, Spinner } from "@nextui-org/react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import LoginForm from "./LoginForm";
import { signOut } from "firebase/auth";
import { auth } from "../config/config";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { MdOutlineLogin, MdOutlineLogout } from "react-icons/md";
import { FaUsersGear } from "react-icons/fa6";

export default function NavbarCustom() {
    const { toggleTheme } = useTheme();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { user, isAdmin, isCompany, loading } = useAuth();

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
        <Navbar

        >
            <NavbarBrand>
                <Link className="font-bold text-inherit text-2xl" href="/">EvalSphere</Link>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem isActive={window.location.pathname === "/formulario"}>
                    <Link
                        href="/formulario"
                        color="foreground"
                    >
                        Formulario
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent as="div" justify="end">
                {user ? (
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="secondary"
                                name={user.displayName || "Usuario"}
                                size="sm"
                                src={user.photoURL || "https://i.pravatar.cc/150"}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Acciones de perfil" variant="flat">
                            <DropdownItem key="profile" textValue="perfil" className="h-14 gap-2">
                                <p className="font-semibold">{user.displayName}</p>
                                <p className="font-semibold">{user.email}</p>
                            </DropdownItem>
                            <DropdownItem key="theme" onClick={toggleTheme} textValue='tema' startContent={<ThemeToggle />}>
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
                ) : (
                    <Button color="secondary" onClick={() => setIsLoginOpen(true)} size="sm" radius="sm" startContent={<MdOutlineLogin />} variant="flat">
                        Iniciar Sesión
                    </Button>
                )}
            </NavbarContent>

            <LoginForm isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </Navbar>
    );
}
