import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail?: string;
  vagaTitle?: string;
}

const ScheduleInterviewModal: React.FC<Props> = ({ open, onClose, candidateName, candidateEmail = '', vagaTitle = '' }) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSchedule = () => {
    if (!date) {
      toast.error('Selecione uma data');
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + Number(duration));

    const formatGCal = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const title = `Entrevista - ${candidateName}${vagaTitle ? ` (${vagaTitle})` : ''}`;
    const details = [
      notes,
      candidateEmail ? `Candidato: ${candidateEmail}` : '',
    ].filter(Boolean).join('\n');

    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.set('action', 'TEMPLATE');
    gcalUrl.searchParams.set('text', title);
    gcalUrl.searchParams.set('dates', `${formatGCal(startDate)}/${formatGCal(endDate)}`);
    if (location) gcalUrl.searchParams.set('location', location);
    if (details) gcalUrl.searchParams.set('details', details);
    if (candidateEmail) gcalUrl.searchParams.set('add', candidateEmail);

    window.open(gcalUrl.toString(), '_blank');
    toast.success(`Google Calendar aberto com a entrevista de ${candidateName}`);
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Duração (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={15} step={15} />
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
            <Button onClick={handleSchedule} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir no Google Calendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewModal;
