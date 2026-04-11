import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail: string;
  vagaTitle?: string;
}

const TEMPLATES = [
  {
    label: 'Selecionado para entrevista',
    subject: (vaga: string) => `Entrevista - ${vaga}`,
    body: (name: string, vaga: string) =>
      `Olá ${name},\n\nTemos o prazer de informar que você foi selecionado(a) para avançar no processo seletivo para a vaga de ${vaga}.\n\nEntraremos em contato em breve para agendar a entrevista.\n\nAtenciosamente,\nEquipe de Recrutamento`,
  },
  {
    label: 'Reprovado no processo',
    subject: (vaga: string) => `Processo Seletivo - ${vaga}`,
    body: (name: string, vaga: string) =>
      `Olá ${name},\n\nAgradecemos seu interesse na vaga de ${vaga} e o tempo dedicado ao processo seletivo.\n\nInfelizmente, desta vez não daremos continuidade à sua candidatura. Mantemos seu currículo em nosso banco de talentos para futuras oportunidades.\n\nAtenciosamente,\nEquipe de Recrutamento`,
  },
  {
    label: 'Solicitar documentos',
    subject: (vaga: string) => `Documentos - ${vaga}`,
    body: (name: string, _vaga: string) =>
      `Olá ${name},\n\nParabéns por avançar no processo seletivo! Para prosseguirmos, precisamos que você envie os seguintes documentos:\n\n- RG ou CNH\n- CPF\n- Comprovante de residência\n- Comprovante de escolaridade\n\nPor favor, responda este e-mail com os documentos em anexo.\n\nAtenciosamente,\nEquipe de Recrutamento`,
  },
  {
    label: 'Em branco',
    subject: (_vaga: string) => '',
    body: (_name: string, _vaga: string) => '',
  },
];

const SendEmailModal: React.FC<Props> = ({ open, onClose, candidateName, candidateEmail, vagaTitle = '' }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const applyTemplate = (index: string) => {
    const tpl = TEMPLATES[+index];
    if (!tpl) return;
    setSubject(tpl.subject(vagaTitle));
    setBody(tpl.body(candidateName, vagaTitle));
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Preencha o assunto e a mensagem');
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(candidateEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    toast.success(`Gmail aberto com o email para ${candidateName}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar E-mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Para</Label>
            <Input value={`${candidateName} <${candidateEmail}>`} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Modelo de mensagem</Label>
            <Select onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um modelo ou escreva do zero..." />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((tpl, i) => (
                  <SelectItem key={i} value={String(i)}>{tpl.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assunto</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do e-mail..." />
          </div>
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escreva sua mensagem..." rows={6} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSend} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir no Gmail
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailModal;
