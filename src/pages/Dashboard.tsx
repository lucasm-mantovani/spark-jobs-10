import { useAppState } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, UserCheck, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { ALL_STATUSES } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'Novo': 'bg-blue-500',
  'Triado': 'bg-yellow-500',
  'Entrevistado': 'bg-purple-500',
  'Teste': 'bg-orange-500',
  'Contratado': 'bg-green-500',
  'Rejeitado': 'bg-red-400',
};

const Dashboard = () => {
  const { vagas, candidates, loading } = useAppState();
  const navigate = useNavigate();

  const activeVagas = vagas.filter(v => v.status === 'active').length;
  const newCandidates = candidates.filter(c => c.status === 'Novo').length;
  const hired = candidates.filter(c => c.status === 'Contratado').length;

  const stats = [
    { label: 'Vagas Ativas', value: activeVagas, icon: Briefcase, color: 'text-primary' },
    { label: 'Total de Candidatos', value: candidates.length, icon: Users, color: 'text-accent' },
    { label: 'Novos Candidatos', value: newCandidates, icon: Clock, color: 'text-warning' },
    { label: 'Contratados', value: hired, icon: UserCheck, color: 'text-success' },
  ];

  // Funil: contagem por status
  const funnelData = ALL_STATUSES.map(status => ({
    status,
    count: candidates.filter(c => c.status === status).length,
  }));
  const maxFunnelCount = Math.max(...funnelData.map(d => d.count), 1);

  // Candidatos por vaga (top 5)
  const vagasComCandidatos = vagas
    .map(v => ({
      ...v,
      total: candidates.filter(c => c.vaga_id === v.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Últimas 5 candidaturas
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border bg-card p-5 h-24 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do processo de recrutamento</p>
      </div>

      {/* Cards de estatísticas */}
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funil de recrutamento */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Funil de Recrutamento</h2>
          </div>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum candidato ainda.</p>
          ) : (
            <div className="space-y-3">
              {funnelData.map(({ status, count }) => (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${STATUS_COLORS[status]}`}
                      style={{ width: `${(count / maxFunnelCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidatos por vaga */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Candidatos por Vaga</h2>
            </div>
            <button
              onClick={() => navigate('/vagas')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {vagasComCandidatos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga criada ainda.</p>
          ) : (
            <div className="space-y-3">
              {vagasComCandidatos.map(v => (
                <div key={v.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground">{v.hiring_model} · {v.status === 'active' ? 'Ativa' : 'Inativa'}</p>
                  </div>
                  <span className="ml-4 shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                    {v.total} candidato{v.total !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimas candidaturas */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Últimas Candidaturas</h2>
          </div>
          <button
            onClick={() => navigate('/candidates')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {recentCandidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma candidatura recebida ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {recentCandidates.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.vaga_title}</p>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
