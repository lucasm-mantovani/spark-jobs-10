import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

const NotFoundContent = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <h1 className="mb-2 text-6xl font-bold text-muted-foreground/40">404</h1>
    <p className="mb-1 text-xl font-semibold text-foreground">Página não encontrada</p>
    <p className="mb-6 text-muted-foreground">O endereço que você acessou não existe.</p>
    <Link to="/vagas" className="text-primary underline hover:text-primary/80">
      Voltar para Vagas
    </Link>
  </div>
);

const NotFound = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  if (loading) return null;

  if (user) {
    return (
      <Layout>
        <NotFoundContent />
      </Layout>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <NotFoundContent />
    </div>
  );
};

export default NotFound;
