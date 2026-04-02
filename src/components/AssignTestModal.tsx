import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAppState } from '@/contexts/AppContext';
import type { CandidateTest } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
}

const availableTests = [
  'Teste Técnico React',
  'Teste Técnico Full Stack',
  'Teste de Lógica',
  'Teste de Personalidade',
  'Teste de Inglês',
  'Case Prático',
];

const AssignTestModal: React.FC<Props> = ({ open, onClose, candidateId, candidateName }) => {
  const { updateCandidate, candidates, addCandidateHistory } = useAppState();
  const [testName, setTestName] = useState('');
  const [customTest, setCustomTest] = useState('');

  const handleAssign = () => {
    const name = testName === 'custom' ? customTest : testName;
    if (!name.trim()) {
      toast.error('Selecione ou digite o nome do teste');
      return;
    }
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const newTest: CandidateTest = {
      id: crypto.randomUUID(),
      test_name: name,
      status: 'Pendente',
      assigned_at: new Date().toISOString(),
    };

    updateCandidate(candidateId, { tests: [...candidate.tests, newTest] });
    addCandidateHistory(candidateId, {
      id: crypto.randomUUID(),
      action: `Teste "${name}" atribuído`,
      created_at: new Date().toISOString(),
    });

    toast.success(`Teste "${name}" atribuído a ${candidateName}`);
    setTestName('');
    setCustomTest('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Teste</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Candidato: <span className="font-medium text-foreground">{candidateName}</span></p>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Selecione o teste</Label>
            <Select value={testName} onValueChange={setTestName}>
              <SelectTrigger><SelectValue placeholder="Escolher teste..." /></SelectTrigger>
              <SelectContent>
                {availableTests.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                <SelectItem value="custom">Outro (personalizado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {testName === 'custom' && (
            <div className="space-y-1.5">
              <Label>Nome do teste</Label>
              <Input value={customTest} onChange={e => setCustomTest(e.target.value)} placeholder="Nome do teste..." />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleAssign}>Atribuir Teste</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTestModal;
