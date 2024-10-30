import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    // Función para obtener el valor del almacenamiento local
    const readValue = (): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    // Estado para almacenar el valor actual
    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Función para actualizar el valor en el estado y en el almacenamiento local
    const setValue = (value: T) => {
        if (typeof window === 'undefined') {
            console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
        }

        try {
            // Permite que el valor sea una función para que tengamos la misma API que useState
            const newValue = value instanceof Function ? value(storedValue) : value;

            // Guardar en el estado
            setStoredValue(newValue);

            // Guardar en el almacenamiento local
            window.localStorage.setItem(key, JSON.stringify(newValue));

            // Disparar un evento para notificar a otros componentes
            window.dispatchEvent(new Event('local-storage'));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setStoredValue(readValue());
        };

        // este es un evento personalizado, disparado en el método setValue
        window.addEventListener('local-storage', handleStorageChange);

        return () => {
            window.removeEventListener('local-storage', handleStorageChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [storedValue, setValue];
}

