import { Card, CardBody, Link } from "@nextui-org/react";
import { FaFacebook, FaTwitter, FaLinkedin, FaHome } from "react-icons/fa";

export default function FooterCustom() {
    return (
        <footer>
            {/* <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <img
                            className="h-10"
                            src="/placeholder.svg?height=40&width=150"
                            alt="Evalsphere logo"
                        />
                        <p className="text-gray-500 text-base">
                            Transformando la evaluación empresarial para un futuro más eficiente.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Facebook</span>
                                <FaFacebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Twitter</span>
                                <FaTwitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">LinkedIn</span>
                                <FaLinkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soluciones</h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Evaluación 360
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Gestión de Desempeño
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Análisis de Competencias
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soporte</h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Precios
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Documentación
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Guías
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Empresa</h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Sobre Nosotros
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Empleos
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Privacidad
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                            Términos
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div> */}
            <Card className="rounded-none  border-t">
                <CardBody className="flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 text-center md:justify-around pt-5">
                    <div className="flex justify-center items-center space-x-4 ">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                            <FaFacebook size={24} />
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                            <FaTwitter size={24} />
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
                            <FaLinkedin size={24} />
                        </a>
                    </div>
                    <p className="text-gray-400 text-center select-none text-xs sm:text-sm ">
                        &copy; 2024 Evalsphere. <span className="hidden sm:inline">Todos los derechos reservados.</span>
                    </p>
                    <div className="flex items-center justify-center gap-1">

                        <Link
                            href="/"
                            className="text-gray-400 hover:text-blue-500"
                            showAnchorIcon
                            anchorIcon={<FaHome className="pl-1" size={20} />}>
                            Home
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </footer>
    )
}