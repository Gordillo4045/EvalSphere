import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

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
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Debe ser un administrador para crear compañías.",
        );
    }

    const {
        name,
        email,
        password,
        location,
        avatar,
        description,
        industry,
        photoURL,
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

export const calculateEvaluationAverages = functions.https.onCall(async (data: { companyId: string }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado para realizar esta acción.');
    }

    const { companyId } = data;
    if (!companyId) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID de la compañía.');
    }

    try {
        // Obtener todas las preguntas y sus categorías
        const questionsSnapshot = await admin.firestore().collection(`companies/${companyId}/surveyQuestions`).get();
        const questionCategories: { [key: string]: string } = {};
        questionsSnapshot.forEach(doc => {
            questionCategories[doc.id] = doc.data().category;
        });

        // Obtener todos los empleados y sus departamentos
        const employeesSnapshot = await admin.firestore().collection(`companies/${companyId}/employees`).get();
        const employeeDepartments: { [key: string]: string } = {};
        employeesSnapshot.forEach(doc => {
            employeeDepartments[doc.id] = doc.data().departmentId;
        });

        // Obtener todas las evaluaciones
        const evaluationsSnapshot = await admin.firestore().collection(`companies/${companyId}/evaluations`).get();

        const employeeCategoryTotals: { [key: string]: { [key: string]: number } } = {};
        const employeeCategoryCounts: { [key: string]: { [key: string]: number } } = {};
        const departmentCategoryTotals: { [key: string]: { [key: string]: number } } = {};
        const departmentCategoryCounts: { [key: string]: { [key: string]: number } } = {};

        evaluationsSnapshot.forEach(evalDoc => {
            const evaluationData = evalDoc.data();
            const evaluatedEmployeeId = evaluationData.evaluatedId;
            const departmentId = employeeDepartments[evaluatedEmployeeId];

            if (!departmentId) {
                console.warn(`Empleado ${evaluatedEmployeeId} no tiene departamento asignado.`);
                return;
            }

            Object.entries(evaluationData).forEach(([questionId, score]) => {
                if (typeof score !== 'number' || !questionCategories[questionId]) return;

                const category = questionCategories[questionId];

                // Acumular para empleados
                if (!employeeCategoryTotals[evaluatedEmployeeId]) {
                    employeeCategoryTotals[evaluatedEmployeeId] = {};
                    employeeCategoryCounts[evaluatedEmployeeId] = {};
                }
                if (!employeeCategoryTotals[evaluatedEmployeeId][category]) {
                    employeeCategoryTotals[evaluatedEmployeeId][category] = 0;
                    employeeCategoryCounts[evaluatedEmployeeId][category] = 0;
                }
                employeeCategoryTotals[evaluatedEmployeeId][category] += score;
                employeeCategoryCounts[evaluatedEmployeeId][category]++;

                // Acumular para departamentos
                if (!departmentCategoryTotals[departmentId]) {
                    departmentCategoryTotals[departmentId] = {};
                    departmentCategoryCounts[departmentId] = {};
                }
                if (!departmentCategoryTotals[departmentId][category]) {
                    departmentCategoryTotals[departmentId][category] = 0;
                    departmentCategoryCounts[departmentId][category] = 0;
                }
                departmentCategoryTotals[departmentId][category] += score;
                departmentCategoryCounts[departmentId][category]++;
            });
        });

        // Calcular promedios finales
        const employeeCategoryAverages: { [key: string]: { [key: string]: number } } = {};
        Object.entries(employeeCategoryTotals).forEach(([employeeId, categories]) => {
            employeeCategoryAverages[employeeId] = {};
            Object.entries(categories).forEach(([category, total]) => {
                const count = employeeCategoryCounts[employeeId][category];
                employeeCategoryAverages[employeeId][category] = total / count;
            });
        });

        const departmentCategoryAverages: { [key: string]: { [key: string]: number } } = {};
        Object.entries(departmentCategoryTotals).forEach(([departmentId, categories]) => {
            departmentCategoryAverages[departmentId] = {};
            Object.entries(categories).forEach(([category, total]) => {
                const count = departmentCategoryCounts[departmentId][category];
                departmentCategoryAverages[departmentId][category] = total / count;
            });
        });

        return { employeeCategoryAverages, departmentCategoryAverages };
    } catch (error) {
        console.error("Error al calcular promedios:", error);
        throw new functions.https.HttpsError('internal', 'Error al calcular los promedios de evaluación');
    }
});