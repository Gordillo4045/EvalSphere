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

        const companyData = {
            id: userRecord.uid,
            name,
            email,
            location,
            avatar: avatar || "",
            description: description || "",
            industry,
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
    const { email, password, name, avatar, companyId, companyName, departmentId, positionId } = data
    try {
        const userCreateData: admin.auth.CreateRequest = {
            email: email,
            password: password,
            displayName: name,
        };
        if (
            avatar &&
            typeof avatar === "string" &&
            avatar.trim() !== ""
        ) {
            userCreateData.photoURL = avatar;
        }

        let uid = "";
        if (data.createAuthUser) {
            const userData = await admin.auth().createUser(userCreateData);
            await admin.auth().setCustomUserClaims(userData.uid, { role: "employee" });
            uid = userData.uid;
        }

        const employeeData = {
            name: name,
            email: email,
            companyId: companyId,
            companyName: companyName,
            departmentId: departmentId,
            positionId: positionId,
            role: "employee",
            avatar: avatar,
            uid: uid || null,
        };

        const employeeUser = {
            email: email,
            name: name,
            puestoTrabajo: positionId,
            role: "employee",
            uid: uid,
            avatar: avatar
        }

        await admin
            .firestore()
            .collection(`companies/${data.companyId}/employees`)
            .doc(uid)
            .set(employeeData);

        await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .set(employeeUser);

        return { success: true, employeeId: uid };
    } catch (error) {
        console.error("Error creating employee:", error);
        throw new functions.https.HttpsError("internal", "Error creating employee");
    }
});

export const deleteEmployee = functions.https.onCall(async (data, context) => {
    const { id } = data;

    try {
        await admin.auth().deleteUser(id);
        await admin.firestore().collection("companies").doc(data.companyId).collection("employees").doc(id).delete();
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
            .update(employeeData);

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

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Error al actualizar empleado: ${error}`,
        );
    }
});
