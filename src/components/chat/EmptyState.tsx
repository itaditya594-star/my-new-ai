import { Image, Code, Globe, FileText, Brain, Languages, Calculator, Lightbulb } from "lucide-react";
import { AiraAvatar } from "@/components/AiraAvatar";

interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void;
}

const suggestions = [
  { icon: Image, text: "Analyze an image", color: "text-blue-500" },
  { icon: Globe, text: "Search the web", color: "text-emerald-500" },
  { icon: Code, text: "Write some code", color: "text-amber-500" },
  { icon: FileText, text: "Create a PDF", color: "text-orange-500" },
  { icon: Languages, text: "Translate text", color: "text-pink-500" },
  { icon: Calculator, text: "Solve math", color: "text-cyan-500" },
  { icon: Brain, text: "Explain a concept", color: "text-purple-500" },
  { icon: Lightbulb, text: "Creative ideas", color: "text-yellow-500" },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center py-12">
      <div className="mb-8 relative bounce-in">
        <AiraAvatar size="xl" state="happy" />
      </div>
      
      <h2 className="mb-3 text-3xl font-semibold">
        <span className="gradient-text">Hi, I am Aira</span>
      </h2>
      
      <p className="text-base text-muted-foreground mb-1">
        Think faster. Work smarter.
      </p>
      
      <p className="text-sm text-muted-foreground/70 mb-10">
        One place. All answers.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick?.(item.text)}
            className="flex flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-all">
              <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
              {item.text}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground/50">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Powered by advanced AI</span>
      </div>
    </div>
  );
}
