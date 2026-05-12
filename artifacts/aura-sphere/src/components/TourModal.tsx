import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TourModal({ isOpen, onClose }: TourModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-panel border border-white/10 shadow-2xl shadow-black/50">
        <DialogHeader>
          <DialogTitle>Tour rápido do Caos</DialogTitle>
          <DialogDescription>
            Veja os principais recursos e comece a usar sua assistente com mais rapidez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3 text-sm text-slate-300">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]">
            <strong className="block text-white">1. Use o modo Chat</strong>
            Converse normalmente ou digite um comando para iniciar uma tarefa.
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]">
            <strong className="block text-white">2. Selecione modos rápidos</strong>
            Alterne entre Chat, Código, Memória, Planejamento e muito mais.
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]">
            <strong className="block text-white">3. Memória e contexto</strong>
            Selecione uma memória para aplicar contexto diretamente à sua resposta.
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]">
            <strong className="block text-white">4. Tema escuro/claro</strong>
            Use o botão de tema para trocar a aparência e manter sua preferência.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
