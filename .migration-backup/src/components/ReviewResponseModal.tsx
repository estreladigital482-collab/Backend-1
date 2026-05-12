import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReviewResponseModalProps {
  isOpen: boolean;
  originalText: string;
  onSubmit: (revisionText: string, comment: string) => void;
  onCancel: () => void;
}

export function ReviewResponseModal({
  isOpen,
  originalText,
  onSubmit,
  onCancel,
}: ReviewResponseModalProps) {
  const [revisionText, setRevisionText] = useState(originalText);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRevisionText(originalText);
      setComment("");
    }
  }, [isOpen, originalText]);

  const handleSubmit = () => {
    if (!revisionText.trim()) return;
    onSubmit(revisionText.trim(), comment.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Revisar resposta</DialogTitle>
          <DialogDescription>
            Ajuste a resposta do assistente e adicione um comentário para guiar a revisão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="revision-text">
              Texto da nova resposta
            </label>
            <Textarea
              id="revision-text"
              value={revisionText}
              onChange={(event) => setRevisionText(event.target.value)}
              className="min-h-[180px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="revision-comment">
              Comentário para a IA
            </label>
            <Textarea
              id="revision-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Explique o que deve ser ajustado ou o tom desejado"
              className="min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!revisionText.trim()}>
            Enviar revisão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
