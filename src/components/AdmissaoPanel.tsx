import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Clock, FileText } from 'lucide-react';
import type { Candidate, Admissao, DocumentoAdmissao } from '@/types';

const DOCUMENTOS_PADRAO: Omit<DocumentoAdmissao, 'id'>[] = [
  { nome: 'RG / CNH', status: 'Pendente' },
  { nome: 'CPF', status: 'Pendente' },
  { nome: 'Carteira de Trabalho (CTPS)', status: 'Pendente' },
  { nome: 'Comprovante de residência', status: 'Pendente' },
  { nome: 'Certidão de nascimento ou casamento', status: 'Pendente' },
  { nome: 'Foto 3x4 recente', status: 'Pendente' },
  { nome: 'Comprovante de escolaridade', status: 'Pendente' },
  { nome: 'PIS / NIT', status: 'Pendente' },
  { nome: 'Dados bancários', status: 'Pendente' },
  { nome: 'Atestado médico admissional', status: 'Pendente' },
  { nome: 'Certidão de nascimento dos filhos (se aplicável)', status: 'Pendente' },
];

const docStatusIcon = (s: DocumentoAdmissao['status']) => {
  if (s === 'Aprovado') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (s === 'Entregue') return <Clock className="h-4 w-4 text-yellow-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
}

const AdmissaoPanel: React.FC<Props> = ({ candidate, open, onClose }) => {
  const { admissoes, upsertAdmissao } = useAppState();
  const [saving, setSaving] = useState(false);
  const [tipoContrato, setTipoContrato] = useState('CLT');
  const [dataInicio, setDataInicio] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<Admissao['status']>('Pendente');
  const [documentos, setDocumentos] = useState<DocumentoAdmissao[]>([]);

  const existing = admissoes.find(a => a.candidate_id === candidate?.id);

  useEffect(() => {
    if (existing) {
      setTipoContrato(existing.tipo_contrato);
      setDataInicio(existing.data_inicio ?? '');
      setObservacoes(existing.observacoes);
      setStatus(existing.status);
      setDocumentos(existing.documentos.length > 0 ? existing.documentos : DOCUMENTOS_PADRAO.map(d => ({ ...d, id: crypto.randomUUID() })));
    } else {
      setTipoContrato('CLT');
      setDataInicio('');
      setObservacoes('');
      setStatus('Pendente');
      setDocumentos(DOCUMENTOS_PADRAO.map(d => ({ ...d, id: crypto.randomUUID() })));
    }
  }, [existing, open]);

  if (!candidate) return null;

  const entregues = documentos.filter(d => d.status !== 'Pendente').length;
  const aprovados = documentos.filter(d => d.status === 'Aprovado').length;

  const toggleDocStatus = (id: string) => {
    setDocumentos(prev => prev.map(d => {
      if (d.id !== id) return d;
      const next: DocumentoAdmissao['status'] = d.status === 'Pendente' ? 'Entregue' : d.status === 'Entregue' ? 'Aprovado' : 'Pendente';
      return { ...d, status: next };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertAdmissao({
        ...(existing?.id ? { id: existing.id } : {}),
        candidate_id: candidate.id,
        status,
        documentos,
        tipo_contrato: tipoContrato,
        data_inicio: dataInicio || null,
        observacoes,
      });
      toast.success('Admissão salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar admissão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Módulo de Admissão
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{candidate.name} — {candidate.vaga_title}</p>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status geral */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
            <div>
              <p className="text-sm font-medium">Status da Admissão</p>
              <p className="text-xs text-muted-foreground mt-0.5">{entregues}/{documentos.length} docs entregues · {aprovados} aprovados</p>
            </div>
            <Select value={status} onValueChange={v => setStatus(v as Admissao['status'])}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dados contratuais */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Dados Contratuais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de Contrato</Label>
                <Select value={tipoContrato} onValueChange={setTipoContrato}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Início</Label>
                <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Checklist de documentos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Checklist de Documentos</h3>
            <p className="text-xs text-muted-foreground">Clique para alternar: Pendente → Entregue → Aprovado</p>
            <div className="space-y-2">
              {documentos.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => toggleDocStatus(doc.id)}
                  className="w-full flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  {docStatusIcon(doc.status)}
                  <span className="text-sm flex-1">{doc.nome}</span>
                  <Badge
                    variant={doc.status === 'Aprovado' ? 'default' : doc.status === 'Entregue' ? 'secondary' : 'outline'}
                    className={`text-xs ${doc.status === 'Aprovado' ? 'bg-green-500' : ''}`}
                  >
                    {doc.status}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre a admissão..."
              rows={3}
            />
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : existing ? 'Salvar Alterações' : 'Iniciar Admissão'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdmissaoPanel;
