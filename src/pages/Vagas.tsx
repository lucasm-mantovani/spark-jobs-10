import React, { useState } from 'react';
import { Plus, Eye, Edit2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const VagasPage = () => {
  const { vagas, updateVaga, candidates } = useAppState();
  const [createOpen, setCreateOpen] = useState(false);
  const [editVaga, setEditVaga] = useState<Vaga | undefined>();
  const [confirmVaga, setConfirmVaga] = useState<Vaga | null>(null);
  const navigate = useNavigate();

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

      {vagas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma vaga criada</h3>
          <p className="text-sm text-muted-foreground mb-4">Comece criando sua primeira vaga</p>
          <Button onClick={() => setCreateOpen(true)}>Criar Nova Vaga</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vagas.map(vaga => (
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
                <span>{candidateCount(vaga.id)} candidato(s)</span>
                <span className="mx-1">•</span>
                <span>{vaga.questions.length} pergunta(s)</span>
              </div>
              <div className="flex gap-1 pt-1 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => navigate(`/formulario/${vaga.id}`)}>
                  <Eye className="h-3 w-3" /> Formulário
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditVaga(vaga); setCreateOpen(true); }}>
                  <Edit2 className="h-3 w-3" /> Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleStatus(vaga)}>
                  {vaga.status === 'active' ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                  {vaga.status === 'active' ? 'Desativar' : 'Ativar'}
                </Button>
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
