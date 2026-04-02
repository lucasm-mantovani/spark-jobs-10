import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Mail, FileText, MessageSquare, Clock } from 'lucide-react';
import type { Candidate, CandidateStatus } from '@/types';

interface Props {
  candidate: Candidate | null;
  onClose: () => void;
}

const statusColors: Record<CandidateStatus, string> = {
  Novo: 'bg-primary',
  Triado: 'bg-warning',
  Entrevistado: 'bg-accent',
  Contratado: 'bg-success',
  Rejeitado: 'bg-destructive',
};

const CandidateDetailModal: React.FC<Props> = ({ candidate, onClose }) => {
  const { updateCandidateStatus, addCandidateNote, vagas } = useAppState();
  const [newNote, setNewNote] = useState('');

  if (!candidate) return null;

  const vaga = vagas.find(v => v.id === candidate.vaga_id);

  const handleStatusChange = (status: CandidateStatus) => {
    updateCandidateStatus(candidate.id, status);
    toast.success(`Status atualizado para "${status}"`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addCandidateNote(candidate.id, newNote);
    setNewNote('');
    toast.success('Nota adicionada');
  };

  const handleSendEmail = () => {
    toast.info('Integração com Gmail será implementada em breve.');
  };

  return (
    <Dialog open={!!candidate} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{candidate.name}</span>
            <Badge className={statusColors[candidate.status]}>{candidate.status}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Info */}
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>📱 {candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Vaga: {candidate.vaga_title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Inscrito em: {new Date(candidate.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Select value={candidate.status} onValueChange={v => handleStatusChange(v as CandidateStatus)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['Novo', 'Triado', 'Entrevistado', 'Contratado', 'Rejeitado'] as CandidateStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="h-4 w-4" /> Enviar E-mail
            </Button>
            {candidate.resume_url && (
              <Button variant="outline" asChild>
                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" /> Ver Currículo
                </a>
              </Button>
            )}
          </div>

          {/* Answers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Respostas do Formulário</h3>
            {vaga?.questions.map(q => (
              <div key={q.id} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">{q.label}</p>
                <p className="text-sm">{candidate.answers[q.id] || '—'}</p>
              </div>
            ))}
            {(!vaga || vaga.questions.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhuma resposta registrada.</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Notas ({candidate.notes.length})
            </h3>
            {candidate.notes.map((note, i) => (
              <div key={i} className="rounded-lg border bg-card p-3 text-sm">{note}</div>
            ))}
            <div className="flex gap-2">
              <Textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Adicionar uma nota..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>Adicionar</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailModal;
