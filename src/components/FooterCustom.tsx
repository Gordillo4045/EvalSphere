import { Card, CardBody } from "@nextui-org/react";

export default function FooterCustom() {
    return (
        <footer className="bg-gray-100 border-t">
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
            <Card className="rounded-none border-t">
                <CardBody>
                    <p className=" text-gray-400 text-center select-none text-xs sm:text-sm">
                        &copy; 2024 Evalsphere. <span className="hidden sm:inline">Todos los derechos reservados.</span>
                    </p>
                </CardBody>
            </Card>

        </footer>
    )
}