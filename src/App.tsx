import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import VagasPage from "@/pages/Vagas";
import CandidatosPage from "@/pages/Candidatos";
import Dashboard from "@/pages/Dashboard";
import Configuracoes from "@/pages/Configuracoes";
import PublicForm from "@/pages/PublicForm";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/vagas" replace />} />
            <Route path="/vagas" element={<Layout><VagasPage /></Layout>} />
            <Route path="/candidatos" element={<Layout><CandidatosPage /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/configuracoes" element={<Layout><Configuracoes /></Layout>} />
            <Route path="/formulario/:id" element={<PublicForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
