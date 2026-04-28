import React, { useState, useMemo } from 'react';
import { Plus, Eye, Edit2, ToggleLeft, ToggleRight, Users, Copy, Check, MoreHorizontal, Search, Share2, Bookmark, Megaphone, ExternalLink, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import CreateVagaModal from '@/components/CreateVagaModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Vaga } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TEMPLATES_KEY = 'safie_vaga_templates';

const portals = [
  { name: 'LinkedIn Jobs', url: (link: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, color: '#0A66C2' },
  { name: 'Indeed', url: (link: string) => `https://www.indeed.com/job/post?url=${encodeURIComponent(link)}`, color: '#003A9B' },
  { name: 'Infojobs', url: (_link: string) => `https://www.infojobs.com.br/empresas/publicar-vaga.aspx`, color: '#FF6600' },
  { name: 'Catho', url: (_link: string) => `https://www.catho.com.br/empresas/publicar-vaga/`, color: '#E30613' },
  { name: 'Gupy', url: (_link: string) => `https://app.gupy.io/`, color: '#6D28D9' },
  { name: 'Trampos', url: (link: string) => `https://trampos.co/vagas/publicar?url=${encodeURIComponent(link)}`, color: '#1A1A1A' },
];

const formatJobText = (vaga: Vaga, formLink: string) => {
  const lines: string[] = [];
  lines.push(`🚀 ${vaga.title}`);
  if (vaga.description) lines.push(`\n${vaga.description}`);
  if (vaga.requirements) lines.push(`\n📋 Requisitos:\n${vaga.requirements}`);
  if (vaga.hiring_model) lines.push(`\n📍 Modelo: ${vaga.hiring_model}`);
  if (vaga.salary_min > 0 && vaga.salary_max > 0) lines.push(`💰 Salário: R$ ${vaga.salary_min.toLocaleString()} – R$ ${vaga.salary_max.toLocaleString()}`);
  lines.push(`\n🔗 Candidate-se: ${formLink}`);
  return lines.join('\n');
};

const VagasPage = () => {
  const { vagas, updateVaga, candidates } = useAppState();
  const { isAdmin } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editVaga, setEditVaga] = useState<Vaga | undefined>();
  const [confirmVaga, setConfirmVaga] = useState<Vaga | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [divulgarVaga, setDivulgarVaga] = useState<Vaga | null>(null);
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

  const saveAsTemplate = (vaga: Vaga) => {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? '[]');
    const template = { id: crypto.randomUUID(), title: vaga.title, description: vaga.description, requirements: vaga.requirements, behavioral_criteria: vaga.behavioral_criteria, hiring_model: vaga.hiring_model, salary_min: vaga.salary_min, salary_max: vaga.salary_max, questions: vaga.questions };
    templates.push(template);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    toast.success(`"${vaga.title}" salva como template`);
  };

  const shareWhatsApp = (vagaId: string, title: string) => {
    const url = `${window.location.origin}/formulario/${vagaId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Estamos com uma vaga aberta: ${title}\nCandidate-se aqui: ${url}`)}`);
  };

  const shareLinkedIn = (vagaId: string) => {
    const url = `${window.location.origin}/formulario/${vagaId}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  };

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
        {isAdmin && (
          <Button onClick={() => { setEditVaga(undefined); setCreateOpen(true); }}>
            <Plus className="h-4 w-4" /> Criar Nova Vaga
          </Button>
        )}
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
                  onClick={() => navigate(`/candidatos?vaga=${vaga.id}`)}
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
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => { setEditVaga(vaga); setCreateOpen(true); }}>
                          <Edit2 className="h-3 w-3 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => saveAsTemplate(vaga)}>
                          <Bookmark className="h-3 w-3 mr-2" /> Salvar como template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setDivulgarVaga(vaga)}>
                      <Megaphone className="h-3 w-3 mr-2" /> Divulgar vaga
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareWhatsApp(vaga.id, vaga.title)}>
                      <Share2 className="h-3 w-3 mr-2" /> WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareLinkedIn(vaga.id)}>
                      <Share2 className="h-3 w-3 mr-2" /> LinkedIn
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleStatus(vaga)}>
                          {vaga.status === 'active'
                            ? <><ToggleRight className="h-3 w-3 mr-2" /> Desativar</>
                            : <><ToggleLeft className="h-3 w-3 mr-2" /> Ativar</>}
                        </DropdownMenuItem>
                      </>
                    )}
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

      {/* Modal Divulgar */}
      <Dialog open={!!divulgarVaga} onOpenChange={() => setDivulgarVaga(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Divulgar — {divulgarVaga?.title}</DialogTitle>
          </DialogHeader>
          {divulgarVaga && (() => {
            const link = `${window.location.origin}/formulario/${divulgarVaga.id}`;
            const text = formatJobText(divulgarVaga, link);
            return (
              <Tabs defaultValue="portais">
                <TabsList className="w-full">
                  <TabsTrigger value="portais" className="flex-1">Portais</TabsTrigger>
                  <TabsTrigger value="texto" className="flex-1">Texto formatado</TabsTrigger>
                </TabsList>
                <TabsContent value="portais" className="space-y-2 pt-2">
                  {portals.map(p => (
                    <a key={p.name} href={p.url(link)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                      <span className="font-medium">{p.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">Catho, Infojobs e Gupy abrem o portal para você criar a vaga manualmente. Use o "Texto formatado" para copiar a descrição.</p>
                </TabsContent>
                <TabsContent value="texto" className="pt-2 space-y-2">
                  <pre className="rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap break-words max-h-64 overflow-y-auto">{text}</pre>
                  <Button size="sm" className="w-full" onClick={() => { navigator.clipboard.writeText(text); toast.success('Texto copiado!'); }}>
                    <ClipboardCopy className="h-3.5 w-3.5 mr-2" /> Copiar texto
                  </Button>
                </TabsContent>
              </Tabs>
            );
          })()}
        </DialogContent>
      </Dialog>

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
