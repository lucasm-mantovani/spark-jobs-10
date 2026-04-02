import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import type { Vaga, FormQuestion, FieldType, HiringModel } from '@/types';
import { useAppState } from '@/contexts/AppContext';
import { toast } from 'sonner';

const fieldTypeLabels: Record<FieldType, string> = {
  short_text: 'Texto curto',
  long_text: 'Texto longo',
  multiple_choice: 'Múltipla escolha',
  scale: 'Escala',
  file_upload: 'Upload de arquivo',
};

interface Props {
  open: boolean;
  onClose: () => void;
  editVaga?: Vaga;
}

const CreateVagaModal: React.FC<Props> = ({ open, onClose, editVaga }) => {
  const { addVaga, updateVaga } = useAppState();
  const [title, setTitle] = useState(editVaga?.title ?? '');
  const [description, setDescription] = useState(editVaga?.description ?? '');
  const [requirements, setRequirements] = useState(editVaga?.requirements ?? '');
  const [behavioral, setBehavioral] = useState(editVaga?.behavioral_criteria ?? '');
  const [hiringModel, setHiringModel] = useState<HiringModel>(editVaga?.hiring_model ?? 'CLT');
  const [salaryMin, setSalaryMin] = useState(editVaga?.salary_min ?? 0);
  const [salaryMax, setSalaryMax] = useState(editVaga?.salary_max ?? 0);
  const [questions, setQuestions] = useState<FormQuestion[]>(editVaga?.questions ?? []);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const generateAiQuestions = async () => {
    setLoadingAi(true);
    // Simulated AI endpoint
    await new Promise(r => setTimeout(r, 1500));
    const suggestions = `1. Descreva uma situação em que você liderou um projeto desafiador.
2. Como você lida com prazos apertados e múltiplas prioridades?
3. Qual foi sua maior contribuição técnica em um projeto anterior?
4. Como você aborda a resolução de conflitos em equipe?
5. Descreva sua experiência com ${requirements.split(',')[0] || 'as tecnologias exigidas'}.`;
    setAiSuggestions(suggestions);
    setLoadingAi(false);
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: crypto.randomUUID(), label: '', type: 'short_text', required: true },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Título da vaga é obrigatório');
      return;
    }
    if (editVaga) {
      updateVaga(editVaga.id, {
        title, description, requirements, behavioral_criteria: behavioral,
        hiring_model: hiringModel, salary_min: salaryMin, salary_max: salaryMax, questions,
      });
      toast.success('Vaga atualizada com sucesso!');
    } else {
      const newVaga: Vaga = {
        id: crypto.randomUUID(),
        title, description, requirements, behavioral_criteria: behavioral,
        hiring_model: hiringModel, salary_min: salaryMin, salary_max: salaryMax,
        questions, status: 'active', created_at: new Date().toISOString(),
      };
      addVaga(newVaga);
      toast.success('Vaga criada com sucesso!');
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editVaga ? 'Editar Vaga' : 'Criar Nova Vaga'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Título da Vaga</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Desenvolvedor Full Stack" />
          </div>
          <div>
            <Label>Descrição da Vaga</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva a vaga..." rows={3} />
          </div>
          <div>
            <Label>Requisitos Mínimos</Label>
            <Textarea value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="Ex: React, Node.js, 3+ anos" rows={2} />
          </div>
          <div>
            <Label>Critérios Comportamentais</Label>
            <Textarea value={behavioral} onChange={e => setBehavioral(e.target.value)} placeholder="Ex: Liderança, comunicação" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Modelo de Contratação</Label>
              <Select value={hiringModel} onValueChange={v => setHiringModel(v as HiringModel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['CLT', 'PJ', 'Estágio', 'Freelancer', 'Temporário'] as HiringModel[]).map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Faixa de Remuneração (R$)</Label>
              <div className="flex gap-2">
                <Input type="number" value={salaryMin || ''} onChange={e => setSalaryMin(+e.target.value)} placeholder="Mín" />
                <Input type="number" value={salaryMax || ''} onChange={e => setSalaryMax(+e.target.value)} placeholder="Máx" />
              </div>
            </div>
          </div>

          {/* AI Question Generator */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Gerar Perguntas com IA</Label>
              <Button size="sm" variant="outline" onClick={generateAiQuestions} disabled={loadingAi}>
                {loadingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loadingAi ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>
            {aiSuggestions && (
              <Textarea value={aiSuggestions} onChange={e => setAiSuggestions(e.target.value)} rows={5} className="text-sm" />
            )}
          </div>

          {/* Form Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Perguntas do Formulário</Label>
              <Button size="sm" variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4" /> Adicionar Pergunta
              </Button>
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border bg-card p-3 space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-bold text-muted-foreground mt-2">{i + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={q.label}
                      onChange={e => updateQuestion(q.id, { label: e.target.value })}
                      placeholder="Texto da pergunta"
                    />
                    <div className="flex gap-2 items-center">
                      <Select value={q.type} onValueChange={v => updateQuestion(q.id, { type: v as FieldType })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(fieldTypeLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {q.type === 'multiple_choice' && (
                        <Input
                          value={q.options?.join(', ') ?? ''}
                          onChange={e => updateQuestion(q.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                          placeholder="Opções separadas por vírgula"
                          className="flex-1"
                        />
                      )}
                      {q.type === 'scale' && (
                        <div className="flex gap-1 items-center text-sm">
                          <Input type="number" className="w-16" value={q.scaleMin ?? 1} onChange={e => updateQuestion(q.id, { scaleMin: +e.target.value })} />
                          <span>a</span>
                          <Input type="number" className="w-16" value={q.scaleMax ?? 10} onChange={e => updateQuestion(q.id, { scaleMax: +e.target.value })} />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>
              {editVaga ? 'Salvar Alterações' : 'Salvar Vaga e Gerar Formulário'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVagaModal;
