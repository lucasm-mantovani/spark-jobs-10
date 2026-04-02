import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppState } from '@/contexts/AppContext';
import { Search, Eye } from 'lucide-react';
import CandidateDetailModal from '@/components/CandidateDetailModal';
import type { Candidate, CandidateStatus } from '@/types';

const statusColors: Record<CandidateStatus, string> = {
  Novo: 'bg-primary',
  Triado: 'bg-warning',
  Entrevistado: 'bg-accent',
  Contratado: 'bg-success',
  Rejeitado: 'bg-destructive',
};

const CandidatosPage = () => {
  const { candidates, vagas } = useAppState();
  const [search, setSearch] = useState('');
  const [filterVaga, setFilterVaga] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    return candidates.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchVaga = filterVaga === 'all' || c.vaga_id === filterVaga;
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchVaga && matchStatus;
    });
  }, [candidates, search, filterVaga, filterStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>
        <p className="text-sm text-muted-foreground">Gerencie e acompanhe todos os candidatos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="pl-9"
          />
        </div>
        <Select value={filterVaga} onValueChange={setFilterVaga}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Todas as vagas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as vagas</SelectItem>
            {vagas.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(['Novo', 'Triado', 'Entrevistado', 'Contratado', 'Rejeitado'] as CandidateStatus[]).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vaga Aplicada</TableHead>
              <TableHead>Data de Inscrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum candidato encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(c => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCandidate(c)}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>{c.vaga_title}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[c.status]}>{c.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedCandidate(c); }}>
                      <Eye className="h-4 w-4" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};

export default CandidatosPage;
