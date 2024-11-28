import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface EvaluationStats {
    total: number;
    count: number;
}

interface EmployeeData {
    name: string;
    positionId: string;
    departmentId: string;
}

interface QuestionData {
    category: string;
    question: string;
}

interface QuestionDetail {
    evaluatorId: string;
    evaluatorName: string;
    question: string;
    score: number;
    relationship: string;
    evaluatorPosition: string;
    evaluatedPosition: string;

}
export const createAdmin = functions.https.onCall(async (data, context) => {
    const { email, password, displayName, photoURL, puestoTrabajo } = data;

    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Debe ser un administrador para crear administradores.",
        );
    }

    try {
        const userCreateData: admin.auth.CreateRequest = {
            email,
            password,
            displayName,
        };

        if (photoURL && typeof photoURL === "string" && photoURL.trim() !== "") {
            userCreateData.photoURL = photoURL;
        }

        const userRecord = await admin.auth().createUser(userCreateData);

        await admin
            .auth()
            .setCustomUserClaims(userRecord.uid, { role: "admin", admin: true });

        await admin
            .firestore()
            .collection("users")
            .doc(userRecord.uid)
            .set({
                uid: userRecord.uid,
                email,
                name: displayName,
                role: "admin",
                puestoTrabajo,
                avatar: photoURL || "",
            });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error("Error al crear administrador:", error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError(
                "internal",
                `Error al crear administrador: ${error.message}`,
            );
        } else {
            throw new functions.https.HttpsError(
                "internal",
                "Error desconocido al crear administrador",
            );
        }
    }
});

export const updateAdmin = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Debe ser un administrador para actualizar administradores.",
        );
    }

    const { uid, email, displayName, photoURL, puestoTrabajo } = data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            email,
            displayName,
        };

        if (photoURL && typeof photoURL === "string" && photoURL.trim() !== "") {
            updateData.photoURL = photoURL;
        }

        await admin.auth().updateUser(uid, updateData);

        await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .update({
                email,
                name: displayName,
                puestoTrabajo,
                avatar: photoURL || "",
            });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar administrador:", error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError(
                "internal",
                `Error al actualizar administrador: ${error.message}`,
            );
        } else {
            throw new functions.https.HttpsError(
                "internal",
                "Error desconocido al actualizar administrador",
            );
        }
    }
});

export const createCompany = functions.https.onCall(async (data, context) => {
    const {
        name,
        email,
        password,
        location,
        avatar,
        description,
        industry,
        photoURL,
        rfc,
        cardNumber,
        expirationDate,
        cvv
    } = data;

    try {
        const userCreateData: admin.auth.CreateRequest = {
            email,
            password,
            displayName: name,
        };

        if (photoURL && typeof photoURL === "string" && photoURL.trim() !== "") {
            userCreateData.photoURL = photoURL;
        }
        const userRecord = await admin.auth().createUser(userCreateData);

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "company" });

        const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const companyData = {
            id: userRecord.uid,
            name,
            email,
            location,
            avatar: avatar || "",
            description: description || "",
            industry,
            invitationCode,
            rfc: rfc || "",
            cardNumber: cardNumber || "",
            expirationDate: expirationDate || "",
            cvv: cvv || "",
        };

        await admin
            .firestore()
            .collection("companies")
            .doc(userRecord.uid)
            .set(companyData);

        const userData = {
            uid: userRecord.uid,
            avatar: avatar || "",
            email,
            name,
            role: "company",
            puestoTrabajo: industry,
        };

        await admin
            .firestore()
            .collection("users")
            .doc(userRecord.uid)
            .set(userData);

        return {
            success: true,
            message: "Compañía creada exitosamente",
            id: userRecord.uid,
        };
    } catch (error) {
        console.error("Error al crear compañía:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al crear compañía: ${error}`,
        );
    }
});

export const updateCompany = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Debe ser un administrador para actualizar compañías.",
        );
    }

    const { id, name, email, location, avatar, description, industry, photoURL } =
        data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            displayName: name,
            email,
        };

        if (photoURL && typeof photoURL === "string" && photoURL.trim() !== "") {
            updateData.photoURL = photoURL;
        }

        await admin.auth().updateUser(id, updateData);

        await admin
            .firestore()
            .collection("companies")
            .doc(id)
            .update({
                name,
                email,
                location,
                avatar: avatar || "",
                description: description || "",
                industry,
            });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar compañía:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al actualizar compañía: ${error}`,
        );
    }
});

export const deleteCompany = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Debe ser un administrador para eliminar compañías.",
        );
    }

    const { id } = data;

    try {
        await admin.auth().deleteUser(id);
        await admin.firestore().collection("companies").doc(id).delete();
        await admin.firestore().collection("users").doc(id).delete();

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar compañía:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al eliminar compañía: ${error}`,
        );
    }
});

export const deleteUser = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an admin to delete users.",
        );
    }

    const { uid } = data;

    try {
        await admin.auth().deleteUser(uid);
        await admin.firestore().collection("users").doc(uid).delete();
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError("internal", "Error deleting user");
    }
});

export const createUser = functions.https.onCall(async (data, context) => {
    try {
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.displayName,
            photoURL: data.photoURL || null,
        });

        await admin
            .firestore()
            .collection("users")
            .doc(userRecord.uid)
            .set({
                uid: userRecord.uid,
                email: data.email,
                name: data.displayName,
                avatar: data.photoURL || null,
                role: data.role,
                puestoTrabajo: data.puestoTrabajo || null,
            });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error("Error creando usuario:", error);
        throw new functions.https.HttpsError("internal", "Error creando usuario");
    }
});

export const createEmployee = functions.https.onCall(async (data, context) => {
    const { email, password, name, avatar, companyId, companyName, departmentId, positionId, invitationCode, addedByCompany } = data;
    try {
        if (!addedByCompany) {
            const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
            if (!companyDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Compañía no encontrada.');
            }
            const companyData = companyDoc.data();
            if (companyData?.invitationCode !== invitationCode) {
                throw new functions.https.HttpsError('invalid-argument', 'Código de invitación inválido.');
            }
        }

        const userCreateData: admin.auth.CreateRequest = {
            email: email,
            password: password,
            displayName: name,
        };
        if (avatar && typeof avatar === "string" && avatar.trim() !== "") {
            userCreateData.photoURL = avatar;
        }

        const userData = await admin.auth().createUser(userCreateData);
        await admin.auth().setCustomUserClaims(userData.uid, { role: "employee" });

        const employeeData = {
            name: name,
            email: email,
            companyId: companyId,
            companyName: companyName,
            departmentId: departmentId,
            positionId: positionId,
            role: "employee",
            avatar: avatar,
            uid: userData.uid,
        };

        const employeeUser = {
            email: email,
            name: name,
            puestoTrabajo: positionId,
            role: "employee",
            uid: userData.uid,
            avatar: avatar
        };

        await admin
            .firestore()
            .collection(`companies/${companyId}/employees`)
            .doc(userData.uid)
            .set({
                uid: userData.uid,
                name: name,
                email: email,
                departmentId: departmentId,
                positionId: positionId,
                avatar: avatar
            });

        await admin
            .firestore()
            .collection(`employees`)
            .doc(userData.uid)
            .set(employeeData);

        await admin
            .firestore()
            .collection("users")
            .doc(userData.uid)
            .set(employeeUser);


        return { success: true, employeeId: userData.uid };
    } catch (error) {
        console.error("Error al crear empleado:", error);
        throw new functions.https.HttpsError('internal', `Error al crear empleado: ${error}`);
    }
});

export const deleteEmployee = functions.https.onCall(async (data, context) => {
    const { id, companyId } = data;

    try {
        await admin.auth().deleteUser(id);
        await admin.firestore().collection("employees").doc(id).delete();
        await admin.firestore().collection("companies").doc(companyId).collection("employees").doc(id).delete();
        await admin.firestore().collection("users").doc(id).delete();

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al eliminar empleado: ${error}`,
        );
    }
});

export const updateEmployee = functions.https.onCall(async (data, context) => {
    const { id, name, email, positionId, departmentId, avatar, companyId } = data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            email,
            displayName: name,
        };

        if (avatar && typeof avatar === "string" && avatar.trim() !== "") {
            updateData.photoURL = avatar;
        }

        await admin.auth().updateUser(id, updateData);

        const employeeData = {
            name,
            email,
            positionId,
            departmentId,
            avatar: avatar,
        };

        if (avatar) {
            employeeData.avatar = avatar;
        }

        await admin.firestore()
            .collection(`companies/${companyId}/employees`)
            .doc(id)
            .update({
                name,
                email,
                positionId,
                departmentId,
                avatar: avatar,
            });

        const userData = {
            name,
            email,
            puestoTrabajo: positionId,
            avatar: avatar,
        };

        if (avatar) {
            userData.avatar = avatar;
        }

        await admin.firestore()
            .collection('users')
            .doc(id)
            .update(userData);

        await admin.firestore().collection('employees').doc(id).update(employeeData);

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al actualizar empleado: ${error}`,
        );
    }
});

// export const calculateEvaluationAverages = functions.https.onCall(async (data: { companyId: string }, context: functions.https.CallableContext) => {
//     if (!context.auth) {
//         throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado para realizar esta acción.');
//     }

//     const { companyId } = data;
//     if (!companyId) {
//         throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID de la compañía.');
//     }

//     try {
//         const db = admin.firestore();
//         const companyRef = db.collection('companies').doc(companyId);

//         // Realizar todas las consultas en paralelo
//         const [questionsSnapshot, employeesSnapshot, evaluationsSnapshot, positionsSnapshot] = await Promise.all([
//             companyRef.collection('surveyQuestions').get(),
//             companyRef.collection('employees').get(),
//             companyRef.collection('evaluations').get(),
//             companyRef.collection('positions').get()
//         ]);

//         interface Stats {
//             total: number;
//             count: number;
//         }

//         interface CategoryMap extends Map<string, Stats> { }

//         // Crear índices optimizados
//         const questionCategories = new Map<string, string>(
//             questionsSnapshot.docs.map(doc => [doc.id, doc.data().category])
//         );

//         // Crear mapa de posiciones con sus niveles
//         const positionsData = Object.fromEntries(
//             positionsSnapshot.docs.map(doc => [doc.id, doc.data().level || 0])
//         );

//         const questionFull = Object.fromEntries(
//             questionsSnapshot.docs.map(doc => [doc.id, doc.data().question])
//         );

//         const employeeDepartments = new Map<string, string>(
//             employeesSnapshot.docs.map(doc => [doc.id, doc.data().departmentId])
//         );

//         const employeesData = Object.fromEntries(
//             employeesSnapshot.docs.map(doc => [doc.id, doc.data()])
//         );

//         // Calcular estadísticas básicas
//         const totalExpectedEvaluations = employeesSnapshot.size * employeesSnapshot.size;
//         const completedEvaluations = evaluationsSnapshot.docs.filter(
//             doc => Object.keys(doc.data()).length > 5
//         ).length;
//         const inProgressEvaluations = totalExpectedEvaluations - completedEvaluations;

//         const employeeCategoryTotals = new Map<string, CategoryMap>();
//         const departmentCategoryTotals = new Map<string, CategoryMap>();

//         // Añadir estructura para almacenar detalles por pregunta
//         interface QuestionDetail {
//             evaluatorId: string;
//             evaluatorName: string;
//             question: string;
//             score: number;
//             relationship: string;
//         }

//         const questionDetails = new Map<string, Map<string, QuestionDetail[]>>();

//         // Procesar evaluaciones
//         for (const evalDoc of evaluationsSnapshot.docs) {
//             const evaluationData = evalDoc.data();
//             const evaluatedEmployeeId = evaluationData.evaluatedId;
//             const evaluatorId = evaluationData.evaluatorId;

//             // Determinar la relación basada en las posiciones
//             const evaluatorPosition = employeesData[evaluatorId]?.positionId;
//             const evaluatedPosition = employeesData[evaluatedEmployeeId]?.positionId;

//             const relationship = evaluatorId === evaluatedEmployeeId
//                 ? "AutoEval"
//                 : evaluatorPosition === evaluatedPosition
//                     ? "Companeros"
//                     : (positionsData[evaluatorPosition] || 0) > (positionsData[evaluatedPosition] || 0)
//                         ? "Jefe"
//                         : "Subordinados";

//             // Obtener nombre del evaluador
//             const evaluatorDoc = await db
//                 .collection('companies')
//                 .doc(companyId)
//                 .collection('employees')
//                 .doc(evaluatorId)
//                 .get();

//             const evaluatorName = evaluatorDoc.exists ? evaluatorDoc.data()?.name : 'Usuario Desconocido';

//             // Procesar cada pregunta
//             for (const [questionId, score] of Object.entries(evaluationData)) {
//                 if (typeof score !== 'number' || !questionCategories.has(questionId)) continue;

//                 const questionText = questionFull.get(questionId) || 'Pregunta no encontrada';

//                 if (!questionDetails.has(evaluatedEmployeeId)) {
//                     questionDetails.set(evaluatedEmployeeId, new Map());
//                 }

//                 const employeeQuestions = questionDetails.get(evaluatedEmployeeId)!;
//                 if (!employeeQuestions.has(questionId)) {
//                     employeeQuestions.set(questionId, []);
//                 }

//                 employeeQuestions.get(questionId)!.push({
//                     evaluatorId,
//                     evaluatorName,
//                     question: questionText,
//                     score,
//                     relationship
//                 });
//             }
//         }

//         // Convertir el Map a un objeto para la respuesta
//         const questionDetailsObject = Object.fromEntries(
//             Array.from(questionDetails.entries()).map(([employeeId, questions]) => [
//                 employeeId,
//                 Object.fromEntries(
//                     Array.from(questions.entries())
//                 )
//             ])
//         );

//         // Procesar evaluaciones
//         for (const evalDoc of evaluationsSnapshot.docs) {
//             const evaluationData = evalDoc.data();
//             const evaluatedEmployeeId = evaluationData.evaluatedId;
//             const departmentId = employeeDepartments.get(evaluatedEmployeeId);

//             if (!departmentId) {
//                 console.warn(`Empleado ${evaluatedEmployeeId} no tiene departamento asignado.`);
//                 continue;
//             }

//             if (!employeeCategoryTotals.has(evaluatedEmployeeId)) {
//                 employeeCategoryTotals.set(evaluatedEmployeeId, new Map());
//             }
//             if (!departmentCategoryTotals.has(departmentId)) {
//                 departmentCategoryTotals.set(departmentId, new Map());
//             }

//             // Procesar cada pregunta
//             for (const [questionId, score] of Object.entries(evaluationData)) {
//                 if (typeof score !== 'number' || !questionCategories.has(questionId)) continue;

//                 const category = questionCategories.get(questionId)!;
//                 const employeeCategories = employeeCategoryTotals.get(evaluatedEmployeeId)!;
//                 const departmentCategories = departmentCategoryTotals.get(departmentId)!;

//                 // Actualizar totales para empleado
//                 if (!employeeCategories.has(category)) {
//                     employeeCategories.set(category, { total: 0, count: 0 });
//                 }
//                 const employeeStats = employeeCategories.get(category)!;
//                 employeeStats.total += score;
//                 employeeStats.count++;

//                 // Actualizar totales para departamento
//                 if (!departmentCategories.has(category)) {
//                     departmentCategories.set(category, { total: 0, count: 0 });
//                 }
//                 const departmentStats = departmentCategories.get(category)!;
//                 departmentStats.total += score;
//                 departmentStats.count++;
//             }
//         }

//         const employeeCategoryAverages = Object.fromEntries(
//             Array.from(employeeCategoryTotals.entries()).map(([employeeId, categories]): [string, Record<string, number>] => [
//                 employeeId,
//                 Object.fromEntries(
//                     Array.from(categories.entries()).map(([category, stats]): [string, number] => [
//                         category,
//                         stats.total / stats.count
//                     ])
//                 )
//             ])
//         );

//         const departmentCategoryAverages = Object.fromEntries(
//             Array.from(departmentCategoryTotals.entries()).map(([departmentId, categories]): [string, Record<string, number>] => [
//                 departmentId,
//                 Object.fromEntries(
//                     Array.from(categories.entries()).map(([category, stats]): [string, number] => [
//                         category,
//                         stats.total / stats.count
//                     ])
//                 )
//             ])
//         );

//         return {
//             employeeCategoryAverages,
//             departmentCategoryAverages,
//             evaluationStats: {
//                 completed: completedEvaluations,
//                 inProgress: inProgressEvaluations,
//                 total: totalExpectedEvaluations
//             },
//             questionDetails: questionDetailsObject
//         };
//     } catch (error) {
//         console.error("Error al calcular promedios:", error);
//         throw new functions.https.HttpsError('internal', 'Error al calcular los promedios de evaluación');
//     }
// });

export const calculateEvaluationAverages = functions.https.onCall(async (
    data: { companyId: string },
    context: functions.https.CallableContext
) => {
    // Validación de autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'El usuario debe estar autenticado para realizar esta acción.'
        );
    }

    const { companyId } = data;
    if (!companyId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Se requiere el ID de la compañía.'
        );
    }

    try {
        const db = admin.firestore();
        const companyRef = db.collection('companies').doc(companyId);

        // Realizar todas las consultas en paralelo
        const [
            questionsSnapshot,
            employeesSnapshot,
            evaluationsSnapshot,
            departmentsSnapshot
        ] = await Promise.all([
            companyRef.collection('surveyQuestions').get(),
            companyRef.collection('employees').get(),
            companyRef.collection('evaluations').get(),
            companyRef.collection('departments').get()
        ]);

        // Crear mapa de posiciones con sus niveles
        const positionsLevels = new Map<string, number>();
        const positionsTitle = new Map<string, string>();

        // Obtener las posiciones de cada departamento
        const positionPromises = departmentsSnapshot.docs.map(async (deptDoc) => {
            const positionsSnapshot = await deptDoc.ref
                .collection('positions')
                .get();

            positionsSnapshot.docs.forEach(posDoc => {
                const data = posDoc.data();
                if (typeof data.level === 'number') {
                    positionsLevels.set(posDoc.id, data.level);
                }
                if (typeof data.title === 'string') {
                    positionsTitle.set(posDoc.id, data.title);
                }
            });
        });

        // Esperar a que se completen todas las consultas de posiciones
        await Promise.all(positionPromises);

        // Crear índices optimizados
        const questionCategories = new Map<string, QuestionData>(
            questionsSnapshot.docs.map(doc => [
                doc.id,
                {
                    category: doc.data().category,
                    question: doc.data().question
                }
            ])
        );

        // Crear mapa de posiciones con sus niveles
        const positionsData = Object.fromEntries(positionsLevels);

        // Mapa de empleados
        const employeesData = Object.fromEntries(
            employeesSnapshot.docs.map(doc => [
                doc.id,
                doc.data() as EmployeeData
            ])
        );

        // Calcular estadísticas básicas
        const totalExpectedEvaluations = employeesSnapshot.size * employeesSnapshot.size;
        const completedEvaluations = evaluationsSnapshot.docs.filter(
            doc => Object.keys(doc.data()).length > 5
        ).length;
        const inProgressEvaluations = totalExpectedEvaluations - completedEvaluations;

        // Mapas para almacenar totales por categoría
        const employeeCategoryTotals = new Map<string, Map<string, EvaluationStats>>();
        const departmentCategoryTotals = new Map<string, Map<string, EvaluationStats>>();

        // Mapa para almacenar detalles de preguntas
        const questionDetails = new Map<string, Map<string, QuestionDetail[]>>();

        // Procesar evaluaciones
        for (const evalDoc of evaluationsSnapshot.docs) {
            const evaluationData = evalDoc.data();
            const evaluatedEmployeeId = evaluationData.evaluatedId;
            const evaluatorId = evaluationData.evaluatorId;

            // Verificar existencia de empleados
            if (!employeesData[evaluatedEmployeeId] || !employeesData[evaluatorId]) {
                console.warn(`Empleado no encontrado: ${evaluatedEmployeeId} o ${evaluatorId}`);
                continue;
            }

            // Determinar la relación basada en las posiciones
            const evaluatorPosition = employeesData[evaluatorId].positionId;
            const evaluatedPosition = employeesData[evaluatedEmployeeId].positionId;

            const relationship = determineRelationship(
                evaluatorId,
                evaluatedEmployeeId,
                evaluatorPosition,
                evaluatedPosition,
                positionsData
            );

            // Obtener nombre del evaluador
            const evaluatorName = employeesData[evaluatorId].name || 'Usuario Desconocido';

            // Procesar cada pregunta
            for (const [questionId, score] of Object.entries(evaluationData)) {
                if (typeof score !== 'number' || !questionCategories.has(questionId)) continue;

                const questionData = questionCategories.get(questionId)!;

                // Registrar detalles de preguntas
                processQuestionDetails(
                    questionDetails,
                    evaluatedEmployeeId,
                    questionId,
                    {
                        evaluatorId,
                        evaluatorName,
                        question: questionData.question,
                        score: score as number,
                        relationship,
                        evaluatorPosition: positionsTitle.get(evaluatorPosition) || evaluatedPosition,
                        evaluatedPosition: positionsTitle.get(evaluatedPosition) || evaluatedPosition
                    }
                );

                // Procesar totales por empleado y departamento
                processEmployeeCategoryTotals(
                    employeeCategoryTotals,
                    departmentCategoryTotals,
                    evaluatedEmployeeId,
                    employeesData[evaluatedEmployeeId].departmentId,
                    questionData.category,
                    score as number
                );
            }
        }

        // Convertir resultados
        const employeeCategoryAverages = calculateCategoryAverages(employeeCategoryTotals);
        const departmentCategoryAverages = calculateCategoryAverages(departmentCategoryTotals);

        const questionDetailsObject = convertQuestionDetailsToObject(questionDetails);

        return {
            employeeCategoryAverages,
            departmentCategoryAverages,
            evaluationStats: {
                completed: completedEvaluations,
                inProgress: inProgressEvaluations,
                total: totalExpectedEvaluations
            },
            questionDetails: questionDetailsObject
        };

    } catch (error: any) {
        // Logging de errores más detallado
        console.error("Error detallado al calcular promedios:", {
            message: error.message,
            stack: error.stack,
            companyId: data.companyId
        });

        throw new functions.https.HttpsError(
            'internal',
            'Error al procesar los promedios de evaluación',
            error.message
        );
    }
});

// Función auxiliar para determinar la relación
function determineRelationship(
    evaluatorId: string,
    evaluatedEmployeeId: string,
    evaluatorPosition: string,
    evaluatedPosition: string,
    positionsData: Record<string, number>
): string {
    if (evaluatorId === evaluatedEmployeeId) return "AutoEval";

    if (evaluatorPosition === evaluatedPosition) return "Compañeros";

    return (positionsData[evaluatorPosition] || 0) > (positionsData[evaluatedPosition] || 0)
        ? "Jefe"
        : "Subordinados";
}

// Función para procesar detalles de preguntas
function processQuestionDetails(
    questionDetails: Map<string, Map<string, QuestionDetail[]>>,
    evaluatedEmployeeId: string,
    questionId: string,
    detail: QuestionDetail
) {
    if (!questionDetails.has(evaluatedEmployeeId)) {
        questionDetails.set(evaluatedEmployeeId, new Map());
    }

    const employeeQuestions = questionDetails.get(evaluatedEmployeeId)!;

    if (!employeeQuestions.has(questionId)) {
        employeeQuestions.set(questionId, []);
    }

    employeeQuestions.get(questionId)!.push(detail);
}

// Función para procesar totales por categoría
function processEmployeeCategoryTotals(
    employeeCategoryTotals: Map<string, Map<string, EvaluationStats>>,
    departmentCategoryTotals: Map<string, Map<string, EvaluationStats>>,
    evaluatedEmployeeId: string,
    departmentId: string,
    category: string,
    score: number
) {
    // Totales por empleado
    if (!employeeCategoryTotals.has(evaluatedEmployeeId)) {
        employeeCategoryTotals.set(evaluatedEmployeeId, new Map());
    }
    const employeeCategories = employeeCategoryTotals.get(evaluatedEmployeeId)!;

    if (!employeeCategories.has(category)) {
        employeeCategories.set(category, { total: 0, count: 0 });
    }
    const employeeStats = employeeCategories.get(category)!;
    employeeStats.total += score;
    employeeStats.count++;

    // Totales por departamento
    if (!departmentCategoryTotals.has(departmentId)) {
        departmentCategoryTotals.set(departmentId, new Map());
    }
    const departmentCategories = departmentCategoryTotals.get(departmentId)!;

    if (!departmentCategories.has(category)) {
        departmentCategories.set(category, { total: 0, count: 0 });
    }
    const departmentStats = departmentCategories.get(category)!;
    departmentStats.total += score;
    departmentStats.count++;
}

// Función para calcular promedios de categorías
function calculateCategoryAverages(
    categoryTotals: Map<string, Map<string, EvaluationStats>>,
): Record<string, Record<string, number>> {
    return Object.fromEntries(
        Array.from(categoryTotals.entries()).map(([id, categories]) => [
            id,
            Object.fromEntries(
                Array.from(categories.entries()).map(([category, stats]) => [
                    category,
                    stats.total / stats.count
                ])
            ),
        ])
    );
}

// Función para convertir detalles de preguntas
function convertQuestionDetailsToObject(
    questionDetails: Map<string, Map<string, QuestionDetail[]>>
): Record<string, Record<string, QuestionDetail[]>> {
    return Object.fromEntries(
        Array.from(questionDetails.entries()).map(([employeeId, questions]) => [
            employeeId,
            Object.fromEntries(
                Array.from(questions.entries())
            )
        ])
    );
}

export const createNotification = functions.https.onCall(async (data, context) => {
    const { type, title, message, companyId, employeeId } = data;

    try {
        await admin.firestore()
            .collection('companies')
            .doc(companyId)
            .collection('notifications')
            .add({
                type,
                title,
                message,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                employeeId
            });

        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Error creating notification');
    }
});

// Trigger cuando un empleado se registra
export const onEmployeeCreated = functions.firestore
    .document('employees/{employeeId}')
    .onCreate(async (snap, context) => {
        const newEmployee = snap.data();

        try {
            await admin.firestore()
                .collection('companies')
                .doc(newEmployee.companyId)
                .collection('notifications')
                .add({
                    type: 'new_employee',
                    title: 'Nuevo Empleado Registrado',
                    message: `${newEmployee.name} se ha unido a la empresa`,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    employeeId: context.params.employeeId
                });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    });

// Trigger cuando se completa una evaluación
export const onEvaluationCreated = functions.firestore
    .document('companies/{companyId}/evaluations/{evaluationId}')
    .onCreate(async (snap, context) => {
        const newEvaluation = snap.data();
        const companyId = context.params.companyId;

        try {
            const evaluatorDoc = await admin.firestore()
                .collection('companies')
                .doc(companyId)
                .collection('employees')
                .doc(newEvaluation.evaluatorId)
                .get();

            const evaluatorName = evaluatorDoc.exists ?
                evaluatorDoc.data()?.name || 'Usuario' :
                'Usuario';

            const evaluatedDoc = await admin.firestore()
                .collection('companies')
                .doc(companyId)
                .collection('employees')
                .doc(newEvaluation.evaluatedId)
                .get();

            const evaluatedName = evaluatedDoc.exists ?
                evaluatedDoc.data()?.name || 'Usuario' :
                'Usuario';

            await admin.firestore()
                .collection('companies')
                .doc(companyId)
                .collection('notifications')
                .add({
                    type: 'new_evaluation',
                    title: 'Nueva Evaluación Completada',
                    message: `${evaluatorName} ha completado una evaluación para ${evaluatedName}`,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    employeeId: newEvaluation.evaluatorId,
                    evaluatedId: newEvaluation.evaluatedId,
                    evaluatorName,
                    evaluatedName
                });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    });
