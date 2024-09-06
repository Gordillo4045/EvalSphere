import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createAdmin = functions.https.onCall(async (data, context) => {
    const { email, password, displayName, photoURL, puestoTrabajo } = data;

    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Debe ser un administrador para crear administradores.');
    }

    try {
        const userCreateData: admin.auth.CreateRequest = {
            email,
            password,
            displayName,
        };

        if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
            userCreateData.photoURL = photoURL;
        }

        const userRecord = await admin.auth().createUser(userCreateData);

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin', admin: true });

        await admin.firestore().collection('usuarios').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name: displayName,
            role: 'admin',
            puestoTrabajo,
            avatar: photoURL || '',
        });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error('Error al crear administrador:', error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError('internal', `Error al crear administrador: ${error.message}`);
        } else {
            throw new functions.https.HttpsError('internal', 'Error desconocido al crear administrador');
        }
    }
});

export const updateAdmin = functions.https.onCall(async (data, context) => {

    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Debe ser un administrador para actualizar administradores.');
    }

    const { uid, email, displayName, photoURL, puestoTrabajo } = data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            email,
            displayName,
        };

        if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
            updateData.photoURL = photoURL;
        }

        await admin.auth().updateUser(uid, updateData);

        await admin.firestore().collection('usuarios').doc(uid).update({
            email,
            name: displayName,
            puestoTrabajo,
            avatar: photoURL || '',
        });

        return { success: true };
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError('internal', `Error al actualizar administrador: ${error.message}`);
        } else {
            throw new functions.https.HttpsError('internal', 'Error desconocido al actualizar administrador');
        }
    }
});

export const createCompany = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Debe ser un administrador para crear compañías.');
    }

    const { name, email, password, location, avatar, description, industry, photoURL } = data;

    try {
        const userCreateData: admin.auth.CreateRequest = {
            email,
            password,
            displayName: name,
        };

        if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
            userCreateData.photoURL = photoURL;
        }
        const userRecord = await admin.auth().createUser(userCreateData);

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'company' });

        const companyData = {
            id: userRecord.uid,
            name,
            email,
            location,
            avatar: avatar || '',
            description: description || '',
            industry,
        };

        await admin.firestore().collection('companies').doc(userRecord.uid).set(companyData);

        const userData = {
            uid: userRecord.uid,
            avatar: avatar || '',
            email,
            name,
            role: 'company',
            puestoTrabajo: industry,
        };

        await admin.firestore().collection('usuarios').doc(userRecord.uid).set(userData)

        return { success: true, message: 'Compañía creada exitosamente', id: userRecord.uid };
    } catch (error) {
        console.error('Error al crear compañía:', error);
        throw new functions.https.HttpsError('internal', `Error al crear compañía: ${error}`);
    }
});

export const updateCompany = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Debe ser un administrador para actualizar compañías.');
    }

    const { id, name, email, location, avatar, description, industry, photoURL } = data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            displayName: name,
            email,
        };

        if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
            updateData.photoURL = photoURL;
        }

        await admin.auth().updateUser(id, updateData);

        await admin.firestore().collection('companies').doc(id).update({
            name,
            email,
            location,
            avatar: avatar || '',
            description: description || '',
            industry,
        });

        return { success: true };
    } catch (error) {
        console.error('Error al actualizar compañía:', error);
        throw new functions.https.HttpsError('internal', `Error al actualizar compañía: ${error}`);
    }
});

export const deleteCompany = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Debe ser un administrador para eliminar compañías.');
    }

    const { id } = data;

    try {
        await admin.auth().deleteUser(id);
        await admin.firestore().collection('companies').doc(id).delete();
        await admin.firestore().collection('usuarios').doc(id).delete();

        return { success: true };
    } catch (error) {
        console.error('Error al eliminar compañía:', error);
        throw new functions.https.HttpsError('internal', `Error al eliminar compañía: ${error}`);
    }
});

export const deleteUser = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Must be an admin to delete users.');
    }

    const { uid } = data;

    try {
        await admin.auth().deleteUser(uid);
        await admin.firestore().collection('usuarios').doc(uid).delete();
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Error deleting user');
    }
});
