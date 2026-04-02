import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail: string;
}

const SendEmailModal: React.FC<Props> = ({ open, onClose, candidateName, candidateEmail }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Preencha o assunto e a mensagem');
      return;
    }
    toast.success(`E-mail enviado para ${candidateName}`);
    toast.info('Integração com Gmail será implementada em breve.');
    setSubject('');
    setBody('');
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
            <Label>Assunto</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do e-mail..." />
          </div>
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escreva sua mensagem..." rows={6} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSend}>Enviar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailModal;
