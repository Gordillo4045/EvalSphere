import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, Image } from "@heroui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Fragment, useMemo, useState } from "react"
import { FaApplePay, FaCreditCard, FaGooglePay, FaPaypal } from "react-icons/fa";
import { httpsCallable } from "@/config/config";
import { storage } from "@/config/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import LoginForm from "../LoginForm";

type Step = 1 | 2 | 3

const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

export default function CompanySignUpForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newCompany, setNewCompany] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        description: "",
        industry: "",
        rfc: "",
        cardNumber: "",
        expirationDate: "",
        cvv: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const resetForm = () => {
        setCurrentStep(1);
        setAvatar(null);
        setPreviewUrl(null);
        setNewCompany({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            location: "",
            description: "",
            industry: "",
            rfc: "",
            cardNumber: "",
            expirationDate: "",
            cvv: "",
        });
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setAvatar(null);
        setPreviewUrl(null);
    };

    const isInvalid = useMemo(() => {
        if (newCompany.email === "") return false;
        return validateEmail(newCompany.email) ? false : true;
    }, [newCompany.email]);

    const isPasswordInvalid = useMemo(() => {
        if (newCompany.password === "" && newCompany.confirmPassword === "") return false;
        return newCompany.password !== newCompany.confirmPassword;
    }, [newCompany.password, newCompany.confirmPassword]);

    const validateStep1 = () => {
        if (!newCompany.name.trim()) {
            toast.error("El nombre es obligatorio");
            return false;
        }
        if (!newCompany.email.trim() || !validateEmail(newCompany.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido");
            return false;
        }
        if (!newCompany.password || newCompany.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return false;
        }
        if (newCompany.password !== newCompany.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return false;
        }

        return true;
    };

    const validateStep2 = () => {
        if (!newCompany.rfc.trim()) {
            toast.error("El RFC es obligatorio");
            return false;
        }
        if (!newCompany.location.trim()) {
            toast.error("La ubicación es obligatoria");
            return false;
        }
        if (!newCompany.industry.trim()) {
            toast.error("La industria es obligatoria");
            return false;
        }
        if (!newCompany.description.trim()) {
            toast.error("La descripción es obligatoria");
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!newCompany.cardNumber.trim()) {
            toast.error("El número de tarjeta es obligatorio");
            return false;
        }
        if (!newCompany.expirationDate.trim()) {
            toast.error("La fecha de expiración es obligatoria");
            return false;
        }
        if (!newCompany.cvv.trim()) {
            toast.error("El CVV es obligatorio");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            default:
                isValid = true;
        }

        if (isValid) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
    }

    const variants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 300 : -300,
                opacity: 0
            };
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                x: direction < 0 ? 300 : -300,
                opacity: 0
            };
        }
    };

    const handleSubmit = async () => {
        if (!validateStep3()) {
            return;
        }

        try {
            setIsSubmitting(true);
            let avatarUrl = "";
            if (avatar) {
                const storageRef = ref(storage, `avatars/${avatar.name}`);
                await uploadBytes(storageRef, avatar);
                avatarUrl = await getDownloadURL(storageRef);
            }

            const createCompanyFunction = httpsCallable('createCompany');
            await toast.promise(
                createCompanyFunction({
                    name: newCompany.name,
                    email: newCompany.email,
                    password: newCompany.password,
                    location: newCompany.location,
                    description: newCompany.description,
                    industry: newCompany.industry,
                    rfc: newCompany.rfc,
                    cardNumber: newCompany.cardNumber,
                    expirationDate: newCompany.expirationDate,
                    cvv: newCompany.cvv,
                    avatar: avatarUrl,
                    photoURL: avatarUrl
                }),
                {
                    loading: 'Creando compañía...',
                    success: 'Compañía creada exitosamente',
                    error: (error) => `Error al crear la compañía: ${error.message}`
                }
            );

            handleClose();
        } catch (error) {
            console.error("Error al crear la compañía:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowLogin = () => {
        handleClose();
        setShowLoginModal(true);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} placement="top-center" scrollBehavior='outside'>
                <ModalContent className="w-full max-w-md p-2">
                    <ModalHeader className="flex justify-between items-center">
                        Registro de empresa
                    </ModalHeader>
                    <ModalBody className="py-0">
                        <div className="flex justify-between items-center mb-2 relative">
                            {[1, 2, 3].map((step, index) => (
                                <Fragment key={step}>
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : step === currentStep
                                                ? 'bg-primary dark:bg-gray-600 text-white'
                                                : 'bg-gray-300 dark:bg-gray-800 text-gray-600'
                                            }`}
                                        initial={{ scale: 1 }}
                                        animate={{ scale: step === currentStep ? 1.2 : 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {step < currentStep ? '✓' : step}
                                    </motion.div>
                                    {index < 2 && (
                                        <div className="flex-grow h-[2px] bg-gray-300 mx-2">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: "0%" }}
                                                animate={{ width: currentStep > step ? "100%" : "0%" }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    )}
                                </Fragment>
                            ))}
                        </div>

                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                            >
                                {currentStep === 1 && (
                                    <>
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                label="Nombre"
                                                autoFocus
                                                variant='underlined'
                                                value={newCompany.name}
                                                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                                isRequired
                                            />
                                            <Input
                                                label="Email"
                                                variant='underlined'
                                                value={newCompany.email}
                                                type="email"
                                                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                                                isRequired
                                                isInvalid={isInvalid}
                                                errorMessage={isInvalid ? "Por favor, ingrese un correo electrónico válido" : ""}
                                            />
                                            <Input
                                                label="Contraseña"
                                                variant='underlined'
                                                type="password"
                                                value={newCompany.password}
                                                onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                                                isRequired
                                            />
                                            <Input
                                                label="Confirmar Contraseña"
                                                variant='underlined'
                                                type="password"
                                                value={newCompany.confirmPassword}
                                                onChange={(e) => setNewCompany({ ...newCompany, confirmPassword: e.target.value })}
                                                isRequired
                                                isInvalid={isPasswordInvalid}
                                                errorMessage={isPasswordInvalid ? "Las contraseñas no coinciden" : ""}
                                            />
                                            {!previewUrl && (
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-38 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                            </svg>
                                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click para subir.</span> </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 600x400px)</p>
                                                        </div>
                                                        <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                                    </label>
                                                </div>
                                            )}
                                            {previewUrl && (
                                                <div className="relative flex justify-center items-center">
                                                    <Image src={previewUrl} isBlurred isZoomed alt="Vista previa" className="rounded-md max-w-full max-h-36 bg-white" />
                                                    <Tooltip content="Eliminar imagen" color='danger' showArrow={true}>
                                                        <Button
                                                            type="button"
                                                            color='danger'
                                                            isIconOnly
                                                            radius='full'
                                                            size='sm'
                                                            variant='shadow'
                                                            className="absolute z-10 top-0 right-0 "
                                                            onClick={handleRemoveImage}
                                                        >
                                                            X
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {currentStep === 2 && (
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            label="RFC"
                                            autoFocus
                                            variant='underlined'
                                            value={newCompany.rfc}
                                            onChange={(e) => setNewCompany({ ...newCompany, rfc: e.target.value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Ubicación"
                                            variant='underlined'
                                            value={newCompany.location}
                                            onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                                            isRequired
                                            description="Calle/Ciudad/Codigo Postal/Estado"
                                        />
                                        <Input
                                            label="Industria"
                                            variant='underlined'
                                            value={newCompany.industry}
                                            onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Descripción"
                                            variant='underlined'
                                            value={newCompany.description}
                                            onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                                            isRequired
                                        />

                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="text-center">
                                        <h5 className="text-base font-semibold mb-2">Metodo de pago</h5>
                                        <div className="flex flex-col gap-4 mt-4 text-left">
                                            <Input
                                                label="Numero de tarjeta"
                                                autoFocus
                                                variant='underlined'
                                                value={newCompany.cardNumber}
                                                onChange={(e) => setNewCompany({ ...newCompany, cardNumber: e.target.value })}
                                                isRequired
                                                type="number"
                                                maxLength={16}
                                                endContent={<FaCreditCard />}
                                            />
                                            <div className="flex gap-4">
                                                <Input
                                                    label="Fecha de expiración"
                                                    variant='underlined'
                                                    value={newCompany.expirationDate}
                                                    onChange={(e) => setNewCompany({ ...newCompany, expirationDate: e.target.value })}
                                                    isRequired

                                                />
                                                <Input
                                                    label="CVV"
                                                    variant='underlined'
                                                    value={newCompany.cvv}
                                                    onChange={(e) => setNewCompany({ ...newCompany, cvv: e.target.value })}
                                                    isRequired
                                                    type="number"
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-background px-2 text-muted-foreground select-none">
                                                        O paga con
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-center space-x-4 mt-4">
                                                <Button variant="flat" >
                                                    <FaPaypal className="h-6" />
                                                </Button>
                                                <Button variant="flat" >
                                                    <FaApplePay className="size-20" />
                                                </Button>
                                                <Button variant="flat" >
                                                    <FaGooglePay className="size-20" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </ModalBody>
                    <ModalFooter className="mt-4 flex justify-between">
                        {currentStep > 1 && (
                            <Button variant="light" onPress={prevStep} >
                                Anterior
                            </Button>
                        )}
                        <Button
                            color="primary"
                            className={`${currentStep === 1 ? 'w-full' : ''}`}
                            onPress={currentStep < 3 ? nextStep : handleSubmit}
                            isDisabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Procesando...
                                </div>
                            ) : (
                                currentStep < 3 ? 'Siguiente' : 'Crear Compañía'
                            )}
                        </Button>
                    </ModalFooter>
                    {currentStep === 1 && (
                        <div className="text-center pb-4">
                            <span className="text-sm text-gray-600">
                                Ya tienes una cuenta?{' '}
                                <Button
                                    variant="light"
                                    onPress={handleShowLogin}
                                >
                                    Iniciar Sesión
                                </Button>
                            </span>
                        </div>
                    )}
                </ModalContent>
            </Modal>

            <LoginForm
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}
