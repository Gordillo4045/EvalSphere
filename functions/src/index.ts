import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const updateUser = functions.https.onCall(async (data, context) => {
    if (!context.auth?.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Must be an admin to update users.');
    }

    const { uid, email, displayName, photoURL, role, puestoTrabajo } = data;

    try {
        const updateData: admin.auth.UpdateRequest = {
            email,
            displayName,
        };

        if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
            updateData.photoURL = photoURL;
        }

        await admin.auth().updateUser(uid, updateData);

        // Actualizar claims personalizados para el rol
        await admin.auth().setCustomUserClaims(uid, { role, admin: role === 'admin' });

        // Actualizar información en Firestore
        await admin.firestore().collection('usuarios').doc(uid).update({
            email,
            name: displayName,
            role,
            puestoTrabajo,
            avatar: photoURL || '',
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating user:', error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError('internal', `Error updating user: ${error.message}`);
        } else {
            throw new functions.https.HttpsError('internal', 'Unknown error updating user');
        }
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

export const createUser = functions.https.onCall(async (data, context) => {
    const { email, password, displayName, photoURL, role, puestoTrabajo } = data;

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


        await admin.auth().setCustomUserClaims(userRecord.uid, { role, admin: role === 'admin' });


        await admin.firestore().collection('usuarios').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name: displayName,
            role,
            puestoTrabajo,
            avatar: photoURL || '',
        });


        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof Error) {
            throw new functions.https.HttpsError('internal', `Error creating user: ${error.message}`);
        } else {
            throw new functions.https.HttpsError('internal', 'Unknown error creating user');
        }
    }
});

// ... otras funciones existentes ...
