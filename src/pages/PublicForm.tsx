import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { CheckCircle2, Upload } from 'lucide-react';
import type { Vaga } from '@/types';

const PublicForm = () => {
  const { id } = useParams<{ id: string }>();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loadingVaga, setLoadingVaga] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('vagas')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setVaga(data as unknown as Vaga);
        }
        setLoadingVaga(false);
      });
  }, [id]);

  if (loadingVaga) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Vaga não encontrada</h1>
          <p className="text-muted-foreground mt-2">Esta vaga pode ter sido removida ou está inativa.</p>
        </div>
      </div>
    );
  }

  if (vaga.status === 'inactive') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Inscrições encerradas</h1>
          <p className="text-muted-foreground mt-2">Esta vaga não está mais aceitando candidaturas.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Candidatura enviada!</h1>
          <p className="text-muted-foreground">Obrigado por se candidatar. Entraremos em contato em breve.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify({
        name,
        email,
        phone: phone || null,
        vaga_id: vaga.id,
        vaga_title: vaga.title,
        status: 'Novo',
        answers,
        notes: [],
        history: [{ id: crypto.randomUUID(), action: 'Candidatura recebida', created_at: new Date().toISOString() }],
        tests: [],
      }));
      const { error } = await supabase.from('candidates').insert(payload as any);

      if (error) throw error;
      setSubmitted(true);
      toast.success('Candidatura enviada com sucesso!');
    } catch {
      toast.error('Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <span className="text-xs font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-bold text-foreground">SAFIE</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{vaga.title}</h1>
            <p className="text-sm text-muted-foreground">{vaga.description}</p>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-muted px-3 py-1">{vaga.hiring_model}</span>
              {vaga.salary_max > 0 && (
                <span className="rounded-full bg-muted px-3 py-1">
                  R$ {vaga.salary_min.toLocaleString()} - {vaga.salary_max.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nome completo *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>

            {/* Resume upload */}
            <div>
              <Label>Currículo (PDF)</Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 rounded-lg border-2 border-dashed bg-muted/50 p-4 cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {resumeFile ? resumeFile.name : 'Clique para enviar seu currículo'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => setResumeFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {/* Dynamic questions */}
            {vaga.questions.map((q, i) => (
              <div key={q.id} className="space-y-1">
                <Label>{i + 1}. {q.label} {q.required && '*'}</Label>
                {q.type === 'short_text' && (
                  <Input
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    required={q.required}
                  />
                )}
                {q.type === 'long_text' && (
                  <Textarea
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={3}
                    required={q.required}
                  />
                )}
                {q.type === 'multiple_choice' && q.options && (
                  <RadioGroup
                    value={answers[q.id] ?? ''}
                    onValueChange={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                  >
                    {q.options.map(opt => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === 'scale' && (
                  <div className="space-y-2">
                    <Slider
                      min={q.scaleMin ?? 1}
                      max={q.scaleMax ?? 10}
                      step={1}
                      value={[+(answers[q.id] ?? q.scaleMin ?? 1)]}
                      onValueChange={v => setAnswers(prev => ({ ...prev, [q.id]: String(v[0]) }))}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{q.scaleMin ?? 1}</span>
                      <span className="font-medium text-foreground">{answers[q.id] ?? q.scaleMin ?? 1}</span>
                      <span>{q.scaleMax ?? 10}</span>
                    </div>
                  </div>
                )}
                {q.type === 'file_upload' && (
                  <Input type="file" onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.files?.[0]?.name ?? '' }))} />
                )}
              </div>
            ))}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;
