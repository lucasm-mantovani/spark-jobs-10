import React, { useState, useMemo } from 'react';
import { Plus, Eye, Edit2, ToggleLeft, ToggleRight, Users, Copy, Check, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/contexts/AppContext';
import CreateVagaModal from '@/components/CreateVagaModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Vaga } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const VagasPage = () => {
  const { vagas, updateVaga, candidates } = useAppState();
  const [createOpen, setCreateOpen] = useState(false);
  const [editVaga, setEditVaga] = useState<Vaga | undefined>();
  const [confirmVaga, setConfirmVaga] = useState<Vaga | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const navigate = useNavigate();

  const copyFormLink = (vagaId: string) => {
    const url = `${window.location.origin}/formulario/${vagaId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(vagaId);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = (vaga: Vaga) => {
    if (vaga.status === 'active') {
      setConfirmVaga(vaga);
    } else {
      updateVaga(vaga.id, { status: 'active' });
      toast.success('Vaga ativada');
    }
  };

  const confirmDeactivate = () => {
    if (!confirmVaga) return;
    updateVaga(confirmVaga.id, { status: 'inactive' });
    toast.success('Vaga desativada');
    setConfirmVaga(null);
  };

  const candidateCount = (vagaId: string) =>
    candidates.filter(c => c.vaga_id === vagaId).length;

  const filteredVagas = useMemo(() => {
    return vagas.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vagas, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vagas</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas vagas de emprego e formulários</p>
        </div>
        <Button onClick={() => { setEditVaga(undefined); setCreateOpen(true); }}>
          <Plus className="h-4 w-4" /> Criar Nova Vaga
        </Button>
      </div>

      {/* Busca e filtros */}
      {vagas.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar vaga..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? 'default' : 'outline'}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : 'Inativas'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {vagas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma vaga criada</h3>
          <p className="text-sm text-muted-foreground mb-4">Comece criando sua primeira vaga</p>
          <Button onClick={() => setCreateOpen(true)}>Criar Nova Vaga</Button>
        </div>
      ) : filteredVagas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma vaga encontrada para "<strong>{search}</strong>"</p>
          <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-xs text-primary hover:underline mt-2">Limpar filtros</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVagas.map(vaga => (
            <div key={vaga.id} className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground leading-tight">{vaga.title}</h3>
                <Badge variant={vaga.status === 'active' ? 'default' : 'secondary'} className={vaga.status === 'active' ? 'bg-success' : ''}>
                  {vaga.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{vaga.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{vaga.hiring_model}</Badge>
                {vaga.salary_max > 0 && (
                  <span>R$ {vaga.salary_min.toLocaleString()} - {vaga.salary_max.toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <button
                  onClick={() => navigate(`/vagas/${vaga.id}`)}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {candidateCount(vaga.id)} {candidateCount(vaga.id) === 1 ? 'candidato' : 'candidatos'}
                </button>
                <span className="mx-1">•</span>
                <span>{vaga.questions.length} {vaga.questions.length === 1 ? 'pergunta' : 'perguntas'}</span>
              </div>
              <div className="flex items-center gap-1 pt-1">
                <Button size="sm" variant="outline" onClick={() => navigate(`/formulario/${vaga.id}`)}>
                  <Eye className="h-3 w-3" /> Ver formulário
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyFormLink(vaga.id)}>
                  {copiedId === vaga.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  {copiedId === vaga.id ? 'Copiado!' : 'Copiar link'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="px-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditVaga(vaga); setCreateOpen(true); }}>
                      <Edit2 className="h-3 w-3 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(vaga)}>
                      {vaga.status === 'active'
                        ? <><ToggleRight className="h-3 w-3 mr-2" /> Desativar</>
                        : <><ToggleLeft className="h-3 w-3 mr-2" /> Ativar</>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateVagaModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditVaga(undefined); }}
        editVaga={editVaga}
      />

      <AlertDialog open={!!confirmVaga} onOpenChange={() => setConfirmVaga(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga <strong>{confirmVaga?.title}</strong> ficará invisível no formulário público e não receberá novas candidaturas. Você pode reativar a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VagasPage;
