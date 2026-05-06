---
source: /workspaces/Aura-sphere-/src/components/ChatMessage.tsx
filename: ChatMessage.tsx
---

# ChatMessage.tsx

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { ChatMessage } from "@/lib/types";

export function ChatMessage({
  message,
  onCopy,
}: {
  message: ChatMessage;
  onCopy: () => void;
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
        className={`group relative max-w-[85%] rounded-3xl border p-4 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
          isUser
            ? "bg-primary text-primary-foreground border-primary/20 rounded-br-sm"
            : "bg-secondary text-secondary-foreground border-secondary/20 rounded-bl-sm"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {isUser ? "Você" : "Assistente"}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

