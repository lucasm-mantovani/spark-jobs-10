import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, Shield, ShieldCheck, Mail, Trash2, Building2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TeamMember { id: string; full_name: string; email: string; role: string; created_at: string; }
interface Invitation { id: string; email: string; role: string; status: string; created_at: string; }
interface CompanySettings { name: string; email: string; website: string; logo: string; primaryColor: string; }

const COMPANY_KEY = 'safie_company_settings';

const Configuracoes = () => {
  const { user, isAdmin, role } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [inviting, setInviting] = useState(false);

  // Empresa
  const [company, setCompany] = useState<CompanySettings>({ name: 'SAFIE', email: '', website: '', logo: '', primaryColor: '#6366f1' });

  useEffect(() => {
    const saved = localStorage.getItem(COMPANY_KEY);
    if (saved) setCompany(JSON.parse(saved));
    if (isAdmin) fetchData(); else setLoading(false);
  }, [isAdmin]);

  const saveCompany = () => {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
    toast({ title: 'Configurações da empresa salvas!' });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');
      const { data: invs } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
      const roleMap = new Map<string, string>();
      (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
      setMembers((profiles ?? []).map((p: any) => ({ id: p.id, full_name: p.full_name || 'Sem nome', email: p.email, role: roleMap.get(p.id) || 'recruiter', created_at: p.created_at })));
      setInvitations((invs ?? []) as Invitation[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', { body: { email: inviteEmail, role: inviteRole, full_name: inviteName } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Convite enviado!', description: `Email de convite enviado para ${inviteEmail}` });
      setInviteEmail(''); setInviteName(''); setInviteRole('recruiter'); setInviteOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Erro ao convidar', description: err.message, variant: 'destructive' });
    } finally { setInviting(false); }
  };

  const handleDeleteInvitation = async () => {
    if (!deleteInviteId) return;
    const { error } = await supabase.from('invitations').delete().eq('id', deleteInviteId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Convite removido' }); fetchData(); }
    setDeleteInviteId(null);
  };

  const roleLabel = (r: string) => r === 'admin' ? 'Admin' : r === 'recruiter' ? 'Recrutador' : r;
  const statusLabel = (s: string) => s === 'pending' ? 'Pendente' : s === 'accepted' ? 'Aceito' : s === 'expired' ? 'Expirado' : s;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie a plataforma e sua conta</p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="mr-2 h-4 w-4" />Convidar Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Convidar Novo Usuário</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Nome do novo usuário" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="usuario@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Papel</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — acesso total</SelectItem>
                      <SelectItem value="recruiter">Recrutador — gerencia vagas e candidatos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="w-full">
                  {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar Convite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue={isAdmin ? 'equipe' : 'empresa'}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="empresa"><Building2 className="h-4 w-4 mr-1.5" />Empresa</TabsTrigger>
          <TabsTrigger value="conta"><User className="h-4 w-4 mr-1.5" />Minha Conta</TabsTrigger>
          <TabsTrigger value="equipe"><Users className="h-4 w-4 mr-1.5" />Equipe</TabsTrigger>
        </TabsList>

        {/* Empresa */}
        <TabsContent value="empresa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Dados exibidos no formulário público de candidatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} placeholder="Ex: SAFIE Consultoria" />
              </div>
              <div className="space-y-2">
                <Label>Email de contato (privacidade)</Label>
                <Input type="email" value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} placeholder="privacidade@empresa.com.br" />
                <p className="text-xs text-muted-foreground">Exibido no bloco de consentimento LGPD do formulário público</p>
              </div>
              <div className="space-y-2">
                <Label>Site (opcional)</Label>
                <Input value={company.website} onChange={e => setCompany(p => ({ ...p, website: e.target.value }))} placeholder="https://empresa.com.br" />
              </div>
              <div className="space-y-2">
                <Label>URL do Logo (opcional)</Label>
                <Input value={company.logo} onChange={e => setCompany(p => ({ ...p, logo: e.target.value }))} placeholder="https://empresa.com.br/logo.png" />
                <p className="text-xs text-muted-foreground">Link público da imagem do logo — será exibido no formulário de candidatura</p>
                {company.logo && (
                  <img src={company.logo} alt="Preview do logo" className="h-12 object-contain rounded border bg-muted/30 p-1" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Cor principal da marca</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={company.primaryColor} onChange={e => setCompany(p => ({ ...p, primaryColor: e.target.value }))} className="h-10 w-16 cursor-pointer rounded border" />
                  <Input value={company.primaryColor} onChange={e => setCompany(p => ({ ...p, primaryColor: e.target.value }))} className="w-32 font-mono text-sm" placeholder="#6366f1" />
                </div>
                <p className="text-xs text-muted-foreground">Cor exibida no cabeçalho do formulário público de candidatura</p>
              </div>
              <Button onClick={saveCompany}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Minha Conta */}
        <TabsContent value="conta" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Minha Conta</CardTitle>
              <CardDescription>Informações do seu perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="mt-1 text-xs">
                    {role === 'admin' ? <><ShieldCheck className="h-3 w-3 mr-1" />Admin</> : 'Recrutador'}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
                <p className="text-sm font-medium">Redefinir Senha</p>
                <p className="text-xs text-muted-foreground">Envie um link de redefinição para {user?.email}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={async () => {
                  if (!user?.email) return;
                  await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/login` });
                  toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada.' });
                }}>
                  Enviar link de redefinição
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipe */}
        <TabsContent value="equipe" className="space-y-4 mt-4">
          {!isAdmin ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Você tem o papel de <strong>{roleLabel(role || '')}</strong>.</p>
                <p className="text-sm text-muted-foreground mt-1">Apenas administradores podem gerenciar usuários.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Equipe</CardTitle>
                  <CardDescription>Membros ativos na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                              {member.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member.full_name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                              {member.role === 'admin' && <ShieldCheck className="mr-1 h-3 w-3" />}
                              {roleLabel(member.role)}
                            </Badge>
                            {member.id === user?.id && <span className="text-xs text-muted-foreground">(você)</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Convites Pendentes</CardTitle>
                  <CardDescription>Aguardando aceitação</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : invitations.filter(i => i.status === 'pending').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum convite pendente.</p>
                  ) : (
                    <div className="space-y-3">
                      {invitations.filter(i => i.status === 'pending').map(inv => (
                        <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{inv.email}</p>
                            <p className="text-xs text-muted-foreground">Enviado em {new Date(inv.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={inv.role === 'admin' ? 'default' : 'secondary'}>{roleLabel(inv.role)}</Badge>
                            <Badge variant="outline">{statusLabel(inv.status)}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteInviteId(inv.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteInviteId} onOpenChange={() => setDeleteInviteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover convite?</AlertDialogTitle>
            <AlertDialogDescription>O convite será cancelado e o usuário não poderá mais usá-lo. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvitation} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Configuracoes;
