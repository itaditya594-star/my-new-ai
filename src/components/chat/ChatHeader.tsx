import { Button } from "@/components/ui/button";
import { AiraAvatar } from "@/components/AiraAvatar";
import { Menu, RotateCcw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function ChatHeader({ onClear, hasMessages, onToggleSidebar, showSidebarToggle }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <AiraAvatar size="sm" />
          <div>
            <h1 className="text-lg font-semibold gradient-text">
              Aira
            </h1>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}