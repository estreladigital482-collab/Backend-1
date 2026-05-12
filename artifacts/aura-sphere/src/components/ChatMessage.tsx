import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { ChatMessage } from "@/lib/types";

export function ChatMessage({
  message,
  onCopy,
  onEdit,
}: {
  message: ChatMessage;
  onCopy: () => void;
  onEdit?: () => void;
}) {
  const [hovering, setHovering] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`group relative max-w-[85%] rounded-3xl border p-4 text-sm leading-relaxed shadow-[0_20px_80px_-36px_rgba(15,23,42,0.75)] transition-all duration-200 ${
          isUser
            ? "bg-gradient-to-br from-slate-900 to-slate-950 border-blue-500/20 text-white rounded-br-sm"
            : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/20 text-slate-100 rounded-bl-sm"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {isUser ? "Você" : "Assistente"}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {!isUser && onEdit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onEdit();
                    }}
                    aria-label="Editar resposta"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar resposta</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onCopy();
                  }}
                  aria-label="Copiar mensagem"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar conteúdo</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_pre]:my-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
