import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Users, Settings, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/vagas', label: 'Vagas', icon: Briefcase },
  { to: '/candidatos', label: 'Candidatos', icon: Users },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/vagas" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SAFIE</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-6 animate-fade-in">{children}</main>
    </div>
  );
};

export default Layout;
