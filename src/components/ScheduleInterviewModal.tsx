import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
}

const ScheduleInterviewModal: React.FC<Props> = ({ open, onClose, candidateName }) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');

  const handleSchedule = () => {
    if (!date) {
      toast.error('Selecione uma data');
      return;
    }
    toast.success(`Entrevista agendada para ${candidateName} em ${format(date, 'dd/MM/yyyy')} às ${time}`);
    toast.info('Integração com Google Calendar será implementada em breve.');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Entrevista</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Candidato: <span className="font-medium text-foreground">{candidateName}</span></p>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" disabled={d => d < new Date()} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label>Horário</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Local / Link</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Google Meet, Zoom ou endereço..." />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas sobre a entrevista..." rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSchedule}>Agendar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewModal;
