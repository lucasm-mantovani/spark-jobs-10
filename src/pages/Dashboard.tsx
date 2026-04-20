import { useAppState } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, UserCheck, Clock, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react';
import { ALL_STATUSES } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  'Novo': '#3b82f6',
  'Triado': '#eab308',
  'Entrevistado': '#a855f7',
  'Teste': '#f97316',
  'Contratado': '#22c55e',
  'Rejeitado': '#f87171',
};

const STATUS_BG: Record<string, string> = {
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
  const conversionRate = candidates.length > 0
    ? Math.round((hired / candidates.length) * 100)
    : 0;

  const stats = [
    { label: 'Vagas Ativas', value: activeVagas, icon: Briefcase, color: 'text-primary' },
    { label: 'Total de Candidatos', value: candidates.length, icon: Users, color: 'text-accent' },
    { label: 'Aguardando Triagem', value: newCandidates, icon: Clock, color: 'text-warning' },
    { label: 'Contratados', value: hired, icon: UserCheck, color: 'text-success' },
  ];

  // Dados do funil para o gráfico
  const funnelData = ALL_STATUSES.map(status => ({
    status,
    total: candidates.filter(c => c.status === status).length,
    fill: STATUS_COLORS[status],
  }));

  // Candidatos por dia — últimos 14 dias
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      candidatos: candidates.filter(c => c.created_at.slice(0, 10) === key).length,
    };
  });

  // Top 5 vagas por candidatos
  const vagasComCandidatos = vagas
    .map(v => ({ ...v, total: candidates.filter(c => c.vaga_id === v.id).length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Últimas 5 candidaturas
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
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

      {/* Métricas principais */}
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

      {/* Taxa de conversão */}
      {candidates.length > 0 && (
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Taxa de Conversão</p>
              <p className="text-xs text-muted-foreground">Candidatos contratados / total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-2 rounded-full bg-success transition-all" style={{ width: `${conversionRate}%` }} />
            </div>
            <span className="text-lg font-bold text-success">{conversionRate}%</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funil com gráfico de barras */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Funil de Recrutamento</h2>
          </div>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum candidato ainda.</p>
              <button onClick={() => navigate('/vagas')} className="text-xs text-primary hover:underline mt-1">
                Compartilhe o link de uma vaga →
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [v, 'Candidatos']} />
                <Bar dataKey="total" radius={4}>
                  {funnelData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Candidatos por dia */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Candidaturas — Últimos 14 dias</h2>
          </div>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma candidatura recebida ainda.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last14} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={24} />
                <Tooltip formatter={(v) => [v, 'Candidaturas']} />
                <Line type="monotone" dataKey="candidatos" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top vagas */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Candidatos por Vaga</h2>
            </div>
            <button onClick={() => navigate('/vagas')} className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {vagasComCandidatos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma vaga criada ainda.</p>
              <button onClick={() => navigate('/vagas')} className="text-xs text-primary hover:underline mt-1">
                Criar primeira vaga →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vagasComCandidatos.map(v => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/vagas/${v.id}`)}
                  className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground">{v.hiring_model} · {v.status === 'active' ? 'Ativa' : 'Inativa'}</p>
                  </div>
                  <span className="ml-4 shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {v.total} {v.total === 1 ? 'candidato' : 'candidatos'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Últimas candidaturas */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Últimas Candidaturas</h2>
            </div>
            <button onClick={() => navigate('/candidatos')} className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {recentCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma candidatura recebida ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Compartilhe o link de uma vaga para começar.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCandidates.map(c => (
                <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.vaga_title}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${STATUS_BG[c.status]}`}>
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
    </div>
  );
};

export default Dashboard;
