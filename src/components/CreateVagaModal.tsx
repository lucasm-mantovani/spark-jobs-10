import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Sparkles, Loader2, GripVertical, Eye, Bookmark, Library, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Vaga, FormQuestion, FieldType, HiringModel, CandidateStatus } from '@/types';
import { ALL_STATUSES } from '@/types';
import { useAppState } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QUESTION_BANK } from '@/lib/questionBank';

const TEMPLATES_KEY = 'safie_vaga_templates';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [behavioral, setBehavioral] = useState('');
  const [hiringModel, setHiringModel] = useState<HiringModel>('CLT');
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [pipelineStages, setPipelineStages] = useState<CandidateStatus[]>([...ALL_STATUSES]);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const templates: any[] = JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? '[]');
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  // Sincroniza estado quando editVaga muda
  useEffect(() => {
    setTitle(editVaga?.title ?? '');
    setDescription(editVaga?.description ?? '');
    setRequirements(editVaga?.requirements ?? '');
    setBehavioral(editVaga?.behavioral_criteria ?? '');
    setHiringModel(editVaga?.hiring_model ?? 'CLT');
    setSalaryMin(editVaga?.salary_min ?? 0);
    setSalaryMax(editVaga?.salary_max ?? 0);
    setQuestions(editVaga?.questions ?? []);
    setPipelineStages((editVaga?.pipeline_stages as CandidateStatus[]) ?? [...ALL_STATUSES]);
    setAiSuggestions('');
  }, [editVaga, open]);

  const generateAiQuestions = async () => {
    if (!title.trim()) {
      toast.error('Preencha o título da vaga antes de gerar perguntas');
      return;
    }
    setLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: { title, description, requirements, behavioral_criteria: behavioral },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const qs: string[] = data.questions ?? [];
      setAiSuggestions(qs.join('\n'));
    } catch (err: any) {
      toast.error('Erro ao gerar perguntas: ' + (err.message ?? 'tente novamente'));
    } finally {
      setLoadingAi(false);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: crypto.randomUUID(), label: '', type: 'short_text', required: true },
    ]);
  };

  const addFromBank = (suggested: { label: string; type: FieldType; options?: string[]; scaleMin?: number; scaleMax?: number }) => {
    const key = suggested.label;
    setQuestions(prev => [
      ...prev,
      { id: crypto.randomUUID(), label: suggested.label, type: suggested.type, options: suggested.options, scaleMin: suggested.scaleMin, scaleMax: suggested.scaleMax, required: true },
    ]);
    setRecentlyAdded(prev => new Set(prev).add(key));
    setTimeout(() => setRecentlyAdded(prev => { const n = new Set(prev); n.delete(key); return n; }), 2000);
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...questions];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    setQuestions(reordered);
    dragItem.current = null;
    dragOver.current = null;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Título da vaga é obrigatório');
      return;
    }
    if (pipelineStages.length === 0) {
      toast.error('Selecione pelo menos uma etapa do pipeline');
      return;
    }
    const payload = {
      title, description, requirements, behavioral_criteria: behavioral,
      hiring_model: hiringModel, salary_min: salaryMin, salary_max: salaryMax, questions,
      pipeline_stages: pipelineStages,
    };
    if (editVaga) {
      try {
        await updateVaga(editVaga.id, payload);
        toast.success('Vaga atualizada com sucesso!');
      } catch {
        toast.error('Erro ao atualizar vaga. Tente novamente.');
        return;
      }
    } else {
      try {
        await addVaga({ ...payload, status: 'active' });
        toast.success('Vaga criada com sucesso!');
      } catch {
        toast.error('Erro ao criar vaga. Tente novamente.');
        return;
      }
    }
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>{editVaga ? 'Editar Vaga' : 'Criar Nova Vaga'}</DialogTitle>
              {!editVaga && templates.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setTemplatesOpen(true)}>
                  <Bookmark className="h-3 w-3 mr-1" /> Usar template ({templates.length})
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Título da Vaga</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Analista de Departamento Pessoal" />
            </div>
            <div>
              <Label>Descrição da Vaga</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva a vaga..." rows={3} />
            </div>
            <div>
              <Label>Requisitos Mínimos</Label>
              <Textarea value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="Ex: Excel avançado, 2+ anos em DP" rows={2} />
            </div>
            <div>
              <Label>Critérios Comportamentais</Label>
              <Textarea value={behavioral} onChange={e => setBehavioral(e.target.value)} placeholder="Ex: Organização, discrição, atenção a detalhes" rows={2} />
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

            {/* Pipeline stages */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Etapas do Pipeline</Label>
              <p className="text-xs text-muted-foreground">Selecione quais etapas aparecerão no Kanban desta vaga</p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map(stage => {
                  const active = pipelineStages.includes(stage);
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setPipelineStages(prev =>
                        active
                          ? prev.filter(s => s !== stage)
                          : [...prev, stage]
                      )}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>
              {pipelineStages.length === 0 && (
                <p className="text-xs text-destructive">Selecione pelo menos uma etapa</p>
              )}
            </div>

            {/* Gerador IA */}
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

            {/* Construtor de perguntas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Perguntas do Formulário</Label>
                <div className="flex gap-2">
                  {questions.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}>
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setBankOpen(true)}>
                    <Library className="h-4 w-4" /> Banco de perguntas
                  </Button>
                  <Button size="sm" variant="outline" onClick={addQuestion}>
                    <Plus className="h-4 w-4" /> Em branco
                  </Button>
                </div>
              </div>
              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma pergunta adicionada. Use o botão acima ou gere com IA.
                </p>
              )}
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  draggable
                  onDragStart={() => { dragItem.current = i; }}
                  onDragEnter={() => { dragOver.current = i; }}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className="rounded-lg border bg-card p-3 space-y-2 cursor-default"
                >
                  <div className="flex gap-2 items-start">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-2 cursor-grab shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={q.label}
                        onChange={e => updateQuestion(q.id, { label: e.target.value })}
                        placeholder="Texto da pergunta"
                      />
                      <div className="flex gap-2 items-center flex-wrap">
                        <Select value={q.type} onValueChange={v => updateQuestion(q.id, { type: v as FieldType })}>
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
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
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-muted-foreground">Obrigatória</span>
                          <Switch
                            checked={q.required}
                            onCheckedChange={v => updateQuestion(q.id, { required: v })}
                          />
                        </div>
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

      {/* Templates */}
      <Sheet open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Templates salvos</SheetTitle>
            <p className="text-xs text-muted-foreground">Clique em um template para carregar seus dados</p>
          </SheetHeader>
          <div className="space-y-3">
            {templates.map((t: any) => (
              <button
                key={t.id}
                className="w-full text-left rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors space-y-1"
                onClick={() => {
                  setTitle(t.title); setDescription(t.description); setRequirements(t.requirements);
                  setBehavioral(t.behavioral_criteria); setHiringModel(t.hiring_model);
                  setSalaryMin(t.salary_min); setSalaryMax(t.salary_max); setQuestions(t.questions ?? []);
                  setTemplatesOpen(false);
                }}
              >
                <p className="font-medium text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.hiring_model} · {t.questions?.length ?? 0} {(t.questions?.length ?? 0) === 1 ? 'pergunta' : 'perguntas'}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Banco de Perguntas */}
      <Sheet open={bankOpen} onOpenChange={setBankOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" /> Banco de Perguntas
            </SheetTitle>
            <p className="text-xs text-muted-foreground">Clique em uma pergunta para adicioná-la ao formulário. Você pode editá-la depois.</p>
          </SheetHeader>
          <Tabs defaultValue={QUESTION_BANK[0].id} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-3 h-auto flex-wrap gap-1 bg-transparent p-0 mb-2">
              {QUESTION_BANK.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2 py-1.5 border rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {cat.emoji} {cat.label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {QUESTION_BANK.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-2 pr-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">
                      {cat.emoji} {cat.label} — {cat.questions.length} sugestões
                    </p>
                    {cat.questions.map((q, i) => {
                      const added = recentlyAdded.has(q.label);
                      return (
                        <button
                          key={i}
                          onClick={() => addFromBank(q)}
                          className={`w-full text-left rounded-lg border p-3 transition-all ${added ? 'border-green-400 bg-green-50 dark:bg-green-950/30' : 'bg-card hover:bg-muted/60 hover:border-primary/40'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm leading-snug">{q.label}</p>
                            <span className={`shrink-0 rounded-full p-1 transition-colors ${added ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'}`}>
                              {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {q.type === 'long_text' ? 'Resposta longa' : q.type === 'short_text' ? 'Resposta curta' : q.type === 'multiple_choice' ? `Múltipla escolha (${q.options?.length} opções)` : q.type === 'scale' ? 'Escala' : q.type}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Preview do formulário */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Preview do Formulário</SheetTitle>
            <p className="text-xs text-muted-foreground">Como o candidato verá o formulário</p>
          </SheetHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <p className="font-semibold">{title || 'Título da vaga'}</p>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CAMPOS FIXOS</Label>
              {['Nome completo *', 'Email *', 'Telefone', 'LinkedIn', 'Pretensão salarial', 'Disponibilidade', 'PCD', 'Currículo (PDF)'].map(f => (
                <div key={f} className="rounded border bg-card px-3 py-2 text-sm text-muted-foreground">{f}</div>
              ))}
            </div>
            {questions.filter(q => q.label.trim()).length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">PERGUNTAS CUSTOMIZADAS</Label>
                {questions.filter(q => q.label.trim()).map((q, i) => (
                  <div key={q.id} className="rounded border bg-card p-3 space-y-1">
                    <p className="text-sm font-medium">{i + 1}. {q.label} {q.required && <span className="text-destructive">*</span>}</p>
                    <p className="text-xs text-muted-foreground">{fieldTypeLabels[q.type]}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded border bg-muted/40 p-3 text-xs text-muted-foreground">
              Consentimento LGPD (obrigatório)
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CreateVagaModal;
