import { HeroUIProvider } from "@heroui/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavbarCustom from "@/components/NavbarCustom";
import FooterCustom from "@/components/FooterCustom";
import { Toaster } from "sonner";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import ProtectedCompanyRoute from "@/components/ProtectedCompanyRoute";
import { useLocation } from "react-router-dom";
import Controlpanel from './pages/Controlpanel';
import CompanyControlPanel from './pages/CompanyControlPanel';
import Formulario from './pages/Formulario';
import Home from "./pages/Home";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import EmployeeSupport from "./pages/EmployeeSupport";
import { useAuth } from "@/hooks/useAuth";
import EmployeeEvaluationResults from "./components/company/EmployeeEvaluationResults";
function AppContent() {
  const location = useLocation();
  const isCompanyControlPanel = location.pathname === "/company/controlpanel";
  const { isEmployee, user } = useAuth();

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
          <Route path="/employee/formulario" element={
            <ProtectedUserRoute>
              <Formulario />
            </ProtectedUserRoute>
          } />
          <Route path="/employee/support" element={
            <ProtectedUserRoute>
              <EmployeeSupport employeeId={isEmployee ? user?.uid : ''} />
            </ProtectedUserRoute>
          } />
          <Route path="/employee/feedback" element={
            <ProtectedUserRoute>
              <EmployeeEvaluationResults
                employeeId={isEmployee ? user?.uid : ''}
              />
            </ProtectedUserRoute>
          } />

        </Routes>
      </div>
      <FooterCustom />
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <HeroUIProvider navigate={navigate}>
        <AppContent />
        <Toaster richColors position="top-left" />
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default App;