import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext<any>(undefined);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme ? storedTheme : "dark";
    });

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    }

    const applyTheme = (currentTheme: string) => {
        const body = document.querySelector("body");
        if (body) {
            body.classList.remove("light", "dark");
            body.classList.add(currentTheme, "text-foreground", "bg-transparent");
        }
    }

    useEffect(() => {
        const currentTheme = localStorage.getItem("theme") ?? "dark";
        applyTheme(currentTheme);
        setTheme(currentTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
