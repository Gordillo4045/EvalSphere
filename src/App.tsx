import { NextUIProvider } from "@nextui-org/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ThemeProvider from "./components/ThemeProvider";
import { useTheme } from "./hooks/useTheme";

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={`${theme} text-foreground bg-background container min-h-dvh grid grid-rows-[auto_1fr_auto]`}>
      <div className="h-12">Navbar</div>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <NextUIProvider navigate={navigate}>
        <AppContent />
      </NextUIProvider>
    </ThemeProvider>
  );
}

export default App;