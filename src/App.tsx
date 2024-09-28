import { NextUIProvider } from "@nextui-org/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ThemeProvider from "./components/ThemeProvider";
import { useTheme } from "./hooks/useTheme";
import NavbarCustom from "./components/NavbarCustom";
import FooterCustom from "./components/FooterCustom";
import Controlpanel from "./pages/Controlpanel";
import { Toaster } from "sonner";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Formulario from "./pages/Formulario";
import ProtectedCompanyRoute from "./components/ProtectedCompanyRoute";
import CompanyControlPanel from "./pages/CompanyControlPanel";
import { useLocation } from "react-router-dom";

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const isCompanyControlPanel = location.pathname === "/company/controlpanel";

  return (
    <>
      <div className={`${theme} text-foreground bg-background flex flex-col min-h-dvh`}>
        {!isCompanyControlPanel && <NavbarCustom />}
        <div className="flex-grow overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/controlpanel" element={
              <ProtectedAdminRoute>
                <Controlpanel />
              </ProtectedAdminRoute>
            } />
            <Route path="/company/controlpanel" element={
              <ProtectedCompanyRoute>
                <CompanyControlPanel />
              </ProtectedCompanyRoute>
            } />
            <Route path="/formulario" element={<Formulario />} />
          </Routes>
        </div>
        <FooterCustom />
      </div>
    </>
  );
}

function App() {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <NextUIProvider navigate={navigate}>
        <AppContent />
        <Toaster richColors position="top-left" />
      </NextUIProvider>
    </ThemeProvider>
  );
}

export default App;