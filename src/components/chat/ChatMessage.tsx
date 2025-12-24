import { cn } from "@/lib/utils";
import { User, Copy, Check, Download, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AiraAvatar } from "@/components/AiraAvatar";
import { exportToPDF } from "@/lib/pdfExport";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useChat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const title = message.content.slice(0, 50).replace(/[#*`]/g, "").trim() || "AI Response";
    exportToPDF(message.content, title);
    toast({ description: "PDF downloaded" });
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content.replace(/[#*`]/g, ""));
    utterance.lang = message.content.match(/[\u0900-\u097F]/) ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className={cn(
      "py-6 message-appear",
      isUser ? "bg-chat-user" : "bg-chat-ai"
    )}>
      <div className="mx-auto max-w-3xl px-4 flex gap-4">
        {isUser ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <AiraAvatar size="sm" state="idle" />
        )}
        <div className="flex-1 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm font-medium",
              isUser ? "text-primary" : "gradient-text"
            )}>
              {isUser ? "You" : "Aira"}
            </p>
            {!isUser && message.content && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-50 hover:opacity-100"
                  onClick={handleSpeak}
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  <Volume2 className={cn("h-3.5 w-3.5", isSpeaking && "text-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-50 hover:opacity-100"
                  onClick={handleExportPDF}
                  title="Export as PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-50 hover:opacity-100"
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Display images if present */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Uploaded ${idx + 1}`}
                  className="max-h-48 rounded-lg border border-border object-cover"
                />
              ))}
            </div>
          )}
          
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
