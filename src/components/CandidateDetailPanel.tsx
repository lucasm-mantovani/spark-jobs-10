import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Mail, FileText, MessageSquare, Clock, Calendar, ClipboardCheck, ExternalLink, XCircle, User, Linkedin, Trash2, Star, UserCheck, MapPin, GraduationCap } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Candidate, CandidateStatus } from '@/types';
import { ALL_STATUSES } from '@/types';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import SendEmailModal from './SendEmailModal';
import AssignTestModal from './AssignTestModal';
import AdmissaoPanel from './AdmissaoPanel';
import ScorecardModal from './ScorecardModal';

interface Props {
  candidate: Candidate | null;
  onClose: () => void;
}

const statusColors: Record<CandidateStatus, string> = {
  Novo: 'bg-primary',
  Triado: 'bg-warning',
  Entrevistado: 'bg-accent',
  Teste: 'bg-secondary text-secondary-foreground',
  Contratado: 'bg-success',
  Rejeitado: 'bg-destructive',
};

const CandidateDetailPanel: React.FC<Props> = ({ candidate, onClose }) => {
  const { updateCandidateStatus, addCandidateNote, deleteCandidate, vagas, updateCandidate } = useAppState();
  const [newNote, setNewNote] = useState('');
  const [showInterview, setShowInterview] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdmissao, setShowAdmissao] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);

  if (!candidate) return null;

  const vaga = vagas.find(v => v.id === candidate.vaga_id);
  const aiScoreValues = Object.values(candidate.ai_scores ?? {});
  const avgScore = aiScoreValues.length > 0
    ? Math.round(aiScoreValues.reduce((a, b) => a + b, 0) / aiScoreValues.length)
    : null;

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

  const handleReject = () => {
    updateCandidateStatus(candidate.id, 'Rejeitado');
    toast.success('Candidato rejeitado');
  };

  const isBancoTalentos = candidate.answers?.['__banco_talentos'] === 'true';
  const toggleBancoTalentos = () => {
    const newVal = isBancoTalentos ? undefined : 'true';
    const updatedAnswers = { ...candidate.answers };
    if (newVal) updatedAnswers['__banco_talentos'] = newVal;
    else delete updatedAnswers['__banco_talentos'];
    updateCandidate(candidate.id, { answers: updatedAnswers });
    toast.success(newVal ? 'Adicionado ao banco de talentos' : 'Removido do banco de talentos');
  };

  const handleDelete = async () => {
    try {
      await deleteCandidate(candidate.id);
      toast.success('Candidato removido');
      onClose();
    } catch {
      toast.error('Erro ao remover candidato');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Sheet open={!!candidate} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle className="text-xl">{candidate.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{candidate.vaga_title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[candidate.status]}>{candidate.status}</Badge>
                {avgScore !== null && (
                  <Badge variant="outline" className="font-mono">
                    Score: {avgScore}%
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Select value={candidate.status} onValueChange={v => handleStatusChange(v as CandidateStatus)}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setShowInterview(true)}>
              <Calendar className="h-3 w-3" /> Agendar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmail(true)}>
              <Mail className="h-3 w-3" /> E-mail
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowTest(true)}>
              <ClipboardCheck className="h-3 w-3" /> Teste
            </Button>
            {candidate.status === 'Entrevistado' && (
              <Button size="sm" variant="outline" onClick={() => setShowScorecard(true)}>
                <FileText className="h-3 w-3" /> Scorecard
              </Button>
            )}
            {candidate.status !== 'Rejeitado' && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={handleReject}>
                <XCircle className="h-3 w-3" /> Rejeitar
              </Button>
            )}
            <Button size="sm" variant={isBancoTalentos ? 'default' : 'outline'} className={isBancoTalentos ? 'bg-yellow-500 hover:bg-yellow-600' : ''} onClick={toggleBancoTalentos}>
              <Star className="h-3 w-3" /> {isBancoTalentos ? 'No banco' : 'Banco de talentos'}
            </Button>
            {candidate.status === 'Contratado' && (
              <Button size="sm" variant="outline" className="text-green-700 border-green-400 hover:bg-green-50" onClick={() => setShowAdmissao(true)}>
                <UserCheck className="h-3 w-3" /> Admissão
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-3 w-3" /> Excluir
            </Button>
          </div>

          <Tabs defaultValue="info" className="pt-4">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="info" className="text-xs"><User className="h-3 w-3 mr-1" />Info</TabsTrigger>
              <TabsTrigger value="answers" className="text-xs"><FileText className="h-3 w-3 mr-1" />Respostas</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />Notas</TabsTrigger>
              <TabsTrigger value="tests" className="text-xs"><ClipboardCheck className="h-3 w-3 mr-1" />Testes</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">📱</span>
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.linkedin && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {(candidate.answers['__estado'] || candidate.answers['__cidade']) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      {[candidate.answers['__cidade'], candidate.answers['__estado']].filter(Boolean).join(' — ')}
                      {candidate.answers['__cep'] && ` · CEP ${candidate.answers['__cep']}`}
                    </span>
                  </div>
                )}
                {candidate.answers['__data_nascimento'] && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">🎂</span>
                    <span>{new Date(candidate.answers['__data_nascimento']).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {candidate.answers['__escolaridade'] && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{candidate.answers['__escolaridade']}</span>
                  </div>
                )}
                {(candidate.answers['__genero'] || candidate.answers['__raca_cor']) && (
                  <div className="flex flex-wrap gap-2">
                    {candidate.answers['__genero'] && (
                      <span className="text-xs rounded-full bg-muted px-2 py-1">{candidate.answers['__genero']}</span>
                    )}
                    {candidate.answers['__raca_cor'] && (
                      <span className="text-xs rounded-full bg-muted px-2 py-1">{candidate.answers['__raca_cor']}</span>
                    )}
                  </div>
                )}
                {candidate.answers['__regime'] && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">🖥️</span>
                    <span>{candidate.answers['__regime']}</span>
                  </div>
                )}
                {candidate.answers['__disp_viagem'] && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">✈️</span>
                    <span>Viagens: {candidate.answers['__disp_viagem']}</span>
                  </div>
                )}
                {candidate.answers['__origem'] && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">📣</span>
                    <span>Origem: {candidate.answers['__origem']}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Inscrito em {new Date(candidate.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Resume */}
              {candidate.resume_url && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Currículo</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" /> Abrir
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* History */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Histórico</h4>
                <div className="relative pl-4 space-y-3">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                  {[...candidate.history].reverse().map(h => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm font-medium">{h.action}</p>
                      {h.details && <p className="text-xs text-muted-foreground">{h.details}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Answers Tab */}
            <TabsContent value="answers" className="space-y-3 mt-4">
              {vaga?.questions.map(q => {
                const score = candidate.ai_scores?.[q.id];
                return (
                  <div key={q.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">{q.label}</p>
                      {score !== undefined && (
                        <Badge variant="outline" className="text-xs font-mono shrink-0">
                          {score}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{candidate.answers[q.id] || '—'}</p>
                    {score !== undefined && (
                      <Progress value={score} className="h-1.5" />
                    )}
                  </div>
                );
              })}
              {(!vaga || vaga.questions.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma resposta registrada.</p>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Adicionar uma nota..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="self-end">Adicionar</Button>
              </div>
              {candidate.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma nota ainda.</p>
              ) : (
                [...candidate.history]
                  .filter(h => h.action === 'Nota adicionada' && h.details)
                  .reverse()
                  .map(h => (
                    <div key={h.id} className="rounded-lg border bg-card p-3 space-y-1">
                      <p className="text-sm">{h.details}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  ))
              )}
            </TabsContent>

            {/* Tests Tab */}
            <TabsContent value="tests" className="space-y-3 mt-4">
              <Button size="sm" variant="outline" onClick={() => setShowTest(true)}>
                <ClipboardCheck className="h-3 w-3" /> Atribuir Novo Teste
              </Button>
              {candidate.tests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum teste atribuído.</p>
              ) : (
                candidate.tests.map(t => (
                  <div key={t.id} className="rounded-lg border bg-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.test_name}</span>
                      <Badge variant={t.status === 'Concluído' ? 'default' : 'secondary'}
                        className={t.status === 'Concluído' ? 'bg-success' : ''}>
                        {t.status}
                      </Badge>
                    </div>
                    {t.score !== undefined && (
                      <div className="flex items-center gap-2">
                        <Progress value={t.score} className="h-1.5 flex-1" />
                        <span className="text-xs font-mono">{t.score}%</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Atribuído em {new Date(t.assigned_at).toLocaleDateString('pt-BR')}
                      {t.completed_at && ` • Concluído em ${new Date(t.completed_at).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <ScheduleInterviewModal open={showInterview} onClose={() => setShowInterview(false)} candidateName={candidate.name} candidateEmail={candidate.email} vagaTitle={candidate.vaga_title} />
      <SendEmailModal open={showEmail} onClose={() => setShowEmail(false)} candidateName={candidate.name} candidateEmail={candidate.email} vagaTitle={candidate.vaga_title} />
      <AssignTestModal open={showTest} onClose={() => setShowTest(false)} candidateId={candidate.id} candidateName={candidate.name} />

      <AdmissaoPanel candidate={candidate} open={showAdmissao} onClose={() => setShowAdmissao(false)} />
      <ScorecardModal open={showScorecard} onClose={() => setShowScorecard(false)} candidateId={candidate.id} candidateName={candidate.name} />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir candidato?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{candidate.name}</strong> será removido permanentemente, incluindo todas as respostas, notas e histórico. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CandidateDetailPanel;
