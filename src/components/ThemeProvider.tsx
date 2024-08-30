import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext<any>(undefined);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme ? storedTheme : "dark";
    });

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        document.querySelector("body")?.classList.replace(theme, newTheme);
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    }

    useEffect(() => {
        const currentTheme = localStorage.getItem("theme") ?? "dark";
        document.querySelector("body")?.classList.add(currentTheme, "text-foreground", "bg-background");
        setTheme(currentTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
