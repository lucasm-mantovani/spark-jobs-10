import { useAppState } from '@/contexts/AppContext';
import { Briefcase, Users, UserCheck, Clock } from 'lucide-react';

const Dashboard = () => {
  const { vagas, candidates } = useAppState();
  const activeVagas = vagas.filter(v => v.status === 'active').length;
  const newCandidates = candidates.filter(c => c.status === 'Novo').length;

  const stats = [
    { label: 'Vagas Ativas', value: activeVagas, icon: Briefcase, color: 'text-primary' },
    { label: 'Total de Candidatos', value: candidates.length, icon: Users, color: 'text-accent' },
    { label: 'Novos Candidatos', value: newCandidates, icon: Clock, color: 'text-warning' },
    { label: 'Contratados', value: candidates.filter(c => c.status === 'Contratado').length, icon: UserCheck, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do processo de recrutamento</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Gráficos e relatórios detalhados em breve.</p>
      </div>
    </div>
  );
};

export default Dashboard;
