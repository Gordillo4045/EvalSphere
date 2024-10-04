import { lazy } from 'react';
import { NextUIProvider } from "@nextui-org/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavbarCustom from "@/components/NavbarCustom";
import FooterCustom from "@/components/FooterCustom";
import { Toaster } from "sonner";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import ProtectedCompanyRoute from "@/components/ProtectedCompanyRoute";
import { useLocation } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const Controlpanel = lazy(() => import("@/pages/Controlpanel"));
const Formulario = lazy(() => import("@/pages/Formulario"));
const CompanyControlPanel = lazy(() => import("@/pages/CompanyControlPanel"));

function AppContent() {
  const location = useLocation();
  const isCompanyControlPanel = location.pathname === "/company/controlpanel";

  return (
    <div className={`text-foreground bg-background flex flex-col min-h-dvh`}>
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
          <Route path="/employee/formulario" element={<Formulario />} />
        </Routes>
      </div>
      <FooterCustom />
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" >
      <NextUIProvider navigate={navigate}>
        <AppContent />
        <Toaster richColors position="top-left" />
      </NextUIProvider>
    </ThemeProvider>
  );
}

export default App;