import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppState } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Star, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CandidateFilters, { type Filters } from '@/components/CandidateFilters';
import CandidateDetailPanel from '@/components/CandidateDetailPanel';
import type { Candidate, CandidateStatus } from '@/types';
import { ALL_STATUSES } from '@/types';
import { useSearchParams } from 'react-router-dom';

const statusColors: Record<CandidateStatus, string> = {
  Novo: 'bg-primary',
  Triado: 'bg-warning',
  Entrevistado: 'bg-accent',
  Teste: 'bg-secondary text-secondary-foreground',
  Contratado: 'bg-success',
  Rejeitado: 'bg-destructive',
};

type SortKey = 'name' | 'email' | 'vaga_title' | 'created_at' | 'status';

const PAGE_SIZE = 10;

const CandidatosPage = () => {
  const { candidates, vagas, updateCandidateStatus } = useAppState();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const vagaParam = searchParams.get('vaga') ?? 'all';
  const [filters, setFilters] = useState<Filters>({ vagaId: vagaParam, statuses: [], keyword: '' });
  const [onlyTalentos, setOnlyTalentos] = useState(false);
  const [onlyIndicados, setOnlyIndicados] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let result = candidates.filter(c => {
      if (filters.vagaId !== 'all' && c.vaga_id !== filters.vagaId) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(c.status)) return false;
      if (filters.dateFrom && new Date(c.created_at) < filters.dateFrom) return false;
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(c.created_at) > end) return false;
      }
      if (onlyTalentos && c.answers?.['__banco_talentos'] !== 'true') return false;
      if (onlyIndicados && !c.answers?.['__indicado_por']) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const inAnswers = Object.values(c.answers).some(a => a.toLowerCase().includes(kw));
        const inName = c.name.toLowerCase().includes(kw);
        const inEmail = c.email.toLowerCase().includes(kw);
        if (!inAnswers && !inName && !inEmail) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [candidates, filters, sortKey, sortDir, onlyTalentos, onlyIndicados]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Keep selected candidate in sync with state
  const syncedCandidate = selectedCandidate
    ? candidates.find(c => c.id === selectedCandidate.id) ?? null
    : null;

  const exportCSV = () => {
    if (filtered.length === 0) { toast.error('Nenhum candidato para exportar'); return; }
    const headers = ['Nome', 'Email', 'Telefone', 'LinkedIn', 'Vaga', 'Status', 'Score IA', 'Data Candidatura', 'Nascimento', 'Estado', 'Cidade', 'CEP', 'Escolaridade', 'Gênero', 'Raça/Cor', 'Regime Preferido', 'Disp. Viagens', 'PCD', 'Pretensão Salarial', 'Disponibilidade', 'Origem'];
    const rows = filtered.map(c => [
      c.name, c.email, c.phone ?? '', c.linkedin ?? '', c.vaga_title, c.status,
      Object.values(c.ai_scores ?? {}).length > 0
        ? Math.round(Object.values(c.ai_scores!).reduce((a, b) => a + b, 0) / Object.values(c.ai_scores!).length) + '%'
        : '',
      new Date(c.created_at).toLocaleDateString('pt-BR'),
      c.answers['__data_nascimento'] ? new Date(c.answers['__data_nascimento']).toLocaleDateString('pt-BR') : '',
      c.answers['__estado'] ?? '',
      c.answers['__cidade'] ?? '',
      c.answers['__cep'] ?? '',
      c.answers['__escolaridade'] ?? '',
      c.answers['__genero'] ?? '',
      c.answers['__raca_cor'] ?? '',
      c.answers['__regime'] ?? '',
      c.answers['__disp_viagem'] ?? '',
      c.answers['__pcd'] ?? '',
      c.answers['__pretensao_salarial'] ?? '',
      c.answers['__disponibilidade'] ?? '',
      c.answers['__origem'] ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `candidatos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${filtered.length} candidatos exportados`);
  };

  const SortHeader = ({ label, sortId }: { label: string; sortId: SortKey }) => (
    <TableHead>
      <button onClick={() => toggleSort(sortId)} className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === sortId ? 'text-primary' : 'text-muted-foreground'}`} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <Switch checked={onlyTalentos} onCheckedChange={setOnlyTalentos} id="talentos" />
            <label htmlFor="talentos" className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer">
              <Star className="h-3 w-3 text-yellow-500" /> Banco de talentos
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={onlyIndicados} onCheckedChange={setOnlyIndicados} id="indicados" />
            <label htmlFor="indicados" className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer">
              <UserCheck className="h-3 w-3 text-blue-500" /> Indicados
            </label>
          </div>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <CandidateFilters
          filters={filters}
          onChange={f => { setFilters(f); setPage(0); }}
          vagas={vagas}
          collapsed={!filtersOpen}
          onToggle={() => setFiltersOpen(p => !p)}
        />

        <div className="flex-1 min-w-0 space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="Nome" sortId="name" />
                  <SortHeader label="Email" sortId="email" />
                  <SortHeader label="Vaga" sortId="vaga_title" />
                  <SortHeader label="Data" sortId="created_at" />
                  <SortHeader label="Status" sortId="status" />
                  <TableHead className="text-xs">Score IA</TableHead>
                  <TableHead className="text-xs w-36">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhum candidato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(c => {
                    const scoreValues = Object.values(c.ai_scores ?? {});
                    const avgScore = scoreValues.length > 0
                      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                      : null;
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                        <TableCell className="text-sm">{c.vaga_title}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[c.status]}>{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {avgScore !== null ? (
                            <span className={`text-sm font-mono font-medium ${avgScore >= 80 ? 'text-success' : avgScore >= 60 ? 'text-warning' : 'text-destructive'}`}>
                              {avgScore}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Select
                            value={c.status}
                            onValueChange={v => {
                              updateCandidateStatus(c.id, v as CandidateStatus);
                              toast.success(`Status alterado para "${v}"`);
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUSES.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CandidateDetailPanel
        candidate={syncedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};

export default CandidatosPage;
