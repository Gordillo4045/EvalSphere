import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/config';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthUser extends User {
    isAdmin: boolean;
    isCompany: boolean;
    isEmployee: boolean;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const authUser: AuthUser = {
                            ...firebaseUser,
                            isAdmin: userData?.role === 'admin',
                            isCompany: userData?.role === 'company',
                            isEmployee: userData?.role === 'employee'
                        };
                        setUser(authUser);
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                });

                return () => unsubscribeDoc();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return {
        user,
        isAdmin: user?.isAdmin || false,
        isCompany: user?.isCompany || false,
        isEmployee: user?.isEmployee || false,
        loading
    };
}
