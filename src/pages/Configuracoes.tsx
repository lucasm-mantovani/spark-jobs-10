import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, Shield, ShieldCheck, Mail, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const Configuracoes = () => {
  const { user, isAdmin, role } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('recruiter');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles with roles
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');
      const { data: invs } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });

      const roleMap = new Map<string, string>();
      roles?.forEach((r: any) => roleMap.set(r.user_id, r.role));

      const teamMembers: TeamMember[] = (profiles || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name || 'Sem nome',
        email: p.email,
        role: roleMap.get(p.id) || 'recruiter',
        created_at: p.created_at,
      }));

      setMembers(teamMembers);
      setInvitations((invs || []) as Invitation[]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);

    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail, role: inviteRole, full_name: inviteName },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Convite enviado!', description: `Um email de convite foi enviado para ${inviteEmail}` });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('recruiter');
      setInviteOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Erro ao convidar', description: err.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Convite removido' });
      fetchData();
    }
  };

  const roleLabel = (r: string) => {
    if (r === 'admin') return 'Admin';
    if (r === 'recruiter') return 'Recrutador';
    return r;
  };

  const roleBadgeVariant = (r: string) => {
    if (r === 'admin') return 'default' as const;
    return 'secondary' as const;
  };

  const statusLabel = (s: string) => {
    if (s === 'pending') return 'Pendente';
    if (s === 'accepted') return 'Aceito';
    if (s === 'expired') return 'Expirado';
    return s;
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie as configurações da plataforma</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Você tem o papel de <strong>{roleLabel(role || '')}</strong>.</p>
            <p className="text-sm text-muted-foreground mt-1">Apenas administradores podem gerenciar usuários e configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie a equipe e configurações da plataforma</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nome Completo</Label>
                <Input
                  id="invite-name"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="Nome do novo usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recrutador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {inviteRole === 'admin'
                    ? 'Admins podem gerenciar usuários, vagas e todas as configurações.'
                    : 'Recrutadores podem gerenciar vagas e candidatos.'}
                </p>
              </div>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="w-full">
                {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Convite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipe
          </CardTitle>
          <CardDescription>Membros ativos na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.full_name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadgeVariant(member.role)}>
                      {member.role === 'admin' ? (
                        <ShieldCheck className="mr-1 h-3 w-3" />
                      ) : null}
                      {roleLabel(member.role)}
                    </Badge>
                    {member.id === user?.id && (
                      <span className="text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Pendentes
          </CardTitle>
          <CardDescription>Convites enviados que aguardam aceitação</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.filter(i => i.status === 'pending').length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum convite pendente.</p>
          ) : (
            <div className="space-y-3">
              {invitations
                .filter(i => i.status === 'pending')
                .map(inv => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-foreground">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {new Date(inv.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={roleBadgeVariant(inv.role)}>{roleLabel(inv.role)}</Badge>
                      <Badge variant="outline">{statusLabel(inv.status)}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInvitation(inv.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
