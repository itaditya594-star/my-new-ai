import { AiraAvatar } from "@/components/AiraAvatar";

export function TypingIndicator() {
  return (
    <div className="py-6 bg-chat-ai message-appear">
      <div className="mx-auto max-w-3xl px-4 flex gap-4">
        <AiraAvatar size="sm" state="thinking" />
        <div className="flex items-center gap-3 py-2">
          <span className="text-sm text-muted-foreground">Aira is thinking</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
