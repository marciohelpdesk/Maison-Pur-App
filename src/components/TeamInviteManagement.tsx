import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTeamInvites } from '@/hooks/useTeamInvites';
import { useTeamMembers, TeamMemberInfo } from '@/hooks/useTeamMembers';
import { Badge } from '@/components/ui/badge';

interface TeamInviteManagementProps {
  userId?: string;
}

export const TeamInviteManagement = ({ userId }: TeamInviteManagementProps) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const { inviteMember, removeMember, isInviting } = useTeamInvites(userId);
  const { members, isLoading, refetch } = useTeamMembers(userId);

  const handleInvite = async () => {
    if (!email.trim()) return;
    const result = await inviteMember(email.trim());
    if (result.success) {
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
      } else {
        setShowInviteModal(false);
        setEmail('');
      }
      refetch();
    }
  };

  const handleRemove = async (member: TeamMemberInfo) => {
    const success = await removeMember(member.id);
    if (success) refetch();
  };

  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowInviteModal(false);
    setEmail('');
    setTempPassword(null);
    setCopiedPassword(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Equipe</h3>
          <p className="text-xs text-muted-foreground">{members.length} membros ativos</p>
        </div>
        <Button size="sm" onClick={() => setShowInviteModal(true)} className="gap-1.5">
          <Plus size={16} />
          Convidar
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(member.name || member.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-sm block">
                    {member.name || member.email || member.member_user_id.slice(0, 8)}
                  </span>
                  {member.email && (
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  )}
                  <Badge variant="secondary" className="text-[10px] ml-1">Cleaner</Badge>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[300px] rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revogar Acesso</AlertDialogTitle>
                    <AlertDialogDescription>
                      O membro perderá acesso ao app e seus jobs futuros serão desatribuídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemove(member)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revogar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum membro na equipe</p>
            <p className="text-xs">Convide membros por email para atribuir jobs</p>
          </div>
        )}
      </div>

      <Dialog open={showInviteModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Convidar Membro
            </DialogTitle>
            <DialogDescription>
              O membro receberá uma conta com acesso limitado aos jobs atribuídos.
            </DialogDescription>
          </DialogHeader>

          {!tempPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleInvite} disabled={!email.trim() || isInviting}>
                  {isInviting ? 'Convidando...' : 'Convidar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-xl space-y-2">
                <p className="text-sm font-medium text-foreground">Conta criada com sucesso!</p>
                <p className="text-xs text-muted-foreground">Envie essa senha temporária para o membro:</p>
                <div className="flex items-center gap-2 bg-background p-2 rounded-lg">
                  <code className="flex-1 text-sm font-mono">{tempPassword}</code>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopyPassword}>
                    {copiedPassword ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={handleCloseModal}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
