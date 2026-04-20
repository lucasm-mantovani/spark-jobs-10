import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import CandidateDetailPanel from '@/components/CandidateDetailPanel';
import CreateVagaModal from '@/components/CreateVagaModal';
import type { Candidate, CandidateStatus, Vaga } from '@/types';
import { ALL_STATUSES } from '@/types';

const columnColors: Record<CandidateStatus, string> = {
  Novo: 'border-t-primary',
  Triado: 'border-t-yellow-400',
  Entrevistado: 'border-t-purple-400',
  Teste: 'border-t-orange-400',
  Contratado: 'border-t-green-500',
  Rejeitado: 'border-t-red-500',
};

const badgeColors: Record<CandidateStatus, string> = {
  Novo: 'bg-primary',
  Triado: 'bg-warning',
  Entrevistado: 'bg-accent',
  Teste: 'bg-secondary text-secondary-foreground',
  Contratado: 'bg-success',
  Rejeitado: 'bg-destructive',
};

const VagaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vagas, candidates, updateCandidateStatus } = useAppState();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState<CandidateStatus | null>(null);
  const draggingId = useRef<string | null>(null);

  const vaga = vagas.find(v => v.id === id);

  if (!vaga) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground mb-4">Vaga não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/vagas')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Vagas
        </Button>
      </div>
    );
  }

  const vagaCandidates = candidates.filter(c => c.vaga_id === id);
  const syncedCandidate = selectedCandidate
    ? candidates.find(c => c.id === selectedCandidate.id) ?? null
    : null;

  const handleDragStart = (candidateId: string) => {
    draggingId.current = candidateId;
  };

  const handleDrop = (status: CandidateStatus) => {
    const cid = draggingId.current;
    if (!cid) return;
    const candidate = candidates.find(c => c.id === cid);
    if (!candidate || candidate.status === status) {
      setDragOverStatus(null);
      return;
    }
    updateCandidateStatus(cid, status);
    toast.success(`Movido para "${status}"`);
    draggingId.current = null;
    setDragOverStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vagas')} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/vagas')}>Vagas</span>
              <span>/</span>
              <span className="text-foreground">{vaga.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{vaga.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={vaga.status === 'active' ? 'default' : 'secondary'} className={vaga.status === 'active' ? 'bg-success' : ''}>
                {vaga.status === 'active' ? 'Ativa' : 'Inativa'}
              </Badge>
              <Badge variant="outline">{vaga.hiring_model}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {vagaCandidates.length} {vagaCandidates.length === 1 ? 'candidato' : 'candidatos'}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Edit2 className="h-3 w-3 mr-1" /> Editar vaga
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {(vaga.pipeline_stages as CandidateStatus[]).map(status => {
            const columnCandidates = vagaCandidates.filter(c => c.status === status);
            const isDragOver = dragOverStatus === status;

            return (
              <div
                key={status}
                className={`w-64 flex flex-col rounded-xl border-t-4 border bg-card transition-colors ${columnColors[status]} ${isDragOver ? 'bg-muted/60' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOverStatus(status); }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={() => handleDrop(status)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b">
                  <span className="text-sm font-semibold">{status}</span>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {columnCandidates.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                  {columnCandidates.length === 0 && (
                    <div className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${isDragOver ? 'border-primary/40 bg-primary/5' : 'border-transparent'}`}>
                      <span className="text-xs text-muted-foreground">{isDragOver ? 'Soltar aqui' : ''}</span>
                    </div>
                  )}
                  {columnCandidates.map(candidate => {
                    const scoreValues = Object.values(candidate.ai_scores ?? {});
                    const avgScore = scoreValues.length > 0
                      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                      : null;

                    return (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={() => handleDragStart(candidate.id)}
                        onDragEnd={() => { draggingId.current = null; setDragOverStatus(null); }}
                        onClick={() => setSelectedCandidate(candidate)}
                        className="rounded-lg border bg-background p-3 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{candidate.name}</p>
                          {avgScore !== null && (
                            <span className={`text-xs font-mono font-semibold shrink-0 ${avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {avgScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CandidateDetailPanel
        candidate={syncedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

      <CreateVagaModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editVaga={vaga as Vaga}
      />
    </div>
  );
};

export default VagaDetalhe;
