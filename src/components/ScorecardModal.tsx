import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/contexts/AppContext';
import { toast } from 'sonner';
import type { HistoryEntry } from '@/types';

const CRITERIOS = [
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'conhecimento', label: 'Conhecimento técnico' },
  { id: 'cultura', label: 'Aderência à cultura' },
  { id: 'postura', label: 'Postura profissional' },
  { id: 'motivacao', label: 'Motivação / fit com a vaga' },
];

const NOTAS = [1, 2, 3, 4, 5];
const notaLabel = (n: number) => ['', 'Insatisfatório', 'Abaixo do esperado', 'Adequado', 'Bom', 'Excelente'][n];
const notaColor = (n: number) => n >= 4 ? 'bg-green-500' : n === 3 ? 'bg-yellow-500' : 'bg-red-500';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
}

const ScorecardModal: React.FC<Props> = ({ open, onClose, candidateId, candidateName }) => {
  const { addCandidateHistory } = useAppState();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [recomendacao, setRecomendacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const allScored = CRITERIOS.every(c => scores[c.id]);
  const media = allScored
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIOS.length).toFixed(1)
    : null;

  const handleSave = async () => {
    if (!allScored || !recomendacao) {
      toast.error('Avalie todos os critérios e selecione uma recomendação');
      return;
    }
    setSaving(true);
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      action: `Scorecard registrado — Média ${media}/5 — ${recomendacao}`,
      details: [
        ...CRITERIOS.map(c => `${c.label}: ${scores[c.id]}/5 (${notaLabel(scores[c.id])})`),
        observacoes ? `Observações: ${observacoes}` : '',
      ].filter(Boolean).join(' | '),
      created_at: new Date().toISOString(),
    };
    try {
      await addCandidateHistory(candidateId, entry);
      toast.success('Scorecard salvo no histórico do candidato');
      setScores({});
      setRecomendacao('');
      setObservacoes('');
      onClose();
    } catch {
      toast.error('Erro ao salvar scorecard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scorecard de Entrevista</DialogTitle>
          <p className="text-sm text-muted-foreground">{candidateName}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Critérios */}
          <div className="space-y-4">
            {CRITERIOS.map(criterio => (
              <div key={criterio.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{criterio.label}</Label>
                  {scores[criterio.id] && (
                    <Badge className={`text-xs ${notaColor(scores[criterio.id])}`}>
                      {notaLabel(scores[criterio.id])}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {NOTAS.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScores(prev => ({ ...prev, [criterio.id]: n }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        scores[criterio.id] === n
                          ? n >= 4 ? 'bg-green-500 text-white border-green-500' : n === 3 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-red-500 text-white border-red-500'
                          : 'bg-muted text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Média */}
          {media && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <span className="text-sm font-medium">Média geral</span>
              <span className={`text-xl font-bold ${parseFloat(media) >= 4 ? 'text-green-600' : parseFloat(media) >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                {media}/5
              </span>
            </div>
          )}

          {/* Recomendação */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Recomendação</Label>
            <Select value={recomendacao} onValueChange={setRecomendacao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma recomendação..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Avançar para próxima etapa">Avançar para próxima etapa</SelectItem>
                <SelectItem value="Aguardar — manter como reserva">Aguardar — manter como reserva</SelectItem>
                <SelectItem value="Não recomendado">Não recomendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Pontos de destaque, preocupações, contexto adicional..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !allScored || !recomendacao}>
              {saving ? 'Salvando...' : 'Salvar Scorecard'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScorecardModal;
