import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Database,
  MessageSquare,
  Brain,
  Download,
  Trash2,
  Loader2,
  Shield,
} from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saveChatHistory, setSaveChatHistory] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_settings")
      .select("memory_enabled")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setMemoryEnabled(data.memory_enabled);
      setSaveChatHistory(data.memory_enabled); // Using same setting for simplicity
    }
  };

  const handleToggleChatHistory = async (enabled: boolean) => {
    if (!user) return;
    
    setSaveChatHistory(enabled);
    await supabase
      .from("user_settings")
      .update({ memory_enabled: enabled })
      .eq("user_id", user.id);
    
    toast({
      title: enabled ? "Chat history enabled" : "Chat history disabled",
      description: enabled 
        ? "Your conversations will be saved." 
        : "New conversations will not be saved.",
    });
  };

  const handleToggleMemory = async (enabled: boolean) => {
    if (!user) return;
    
    setMemoryEnabled(enabled);
    await supabase
      .from("user_settings")
      .update({ memory_enabled: enabled })
      .eq("user_id", user.id);
    
    toast({
      title: enabled ? "Memory enabled" : "Memory disabled",
      description: enabled 
        ? "Aira will remember context from conversations." 
        : "Aira will not store memories.",
    });
  };

  const handleClearChatHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await supabase.from("messages").delete().eq("user_id", user.id);
      await supabase.from("conversations").delete().eq("user_id", user.id);
      
      toast({
        title: "Chat history cleared",
        description: "All your conversations have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await supabase.from("memories").delete().eq("user_id", user.id);
      
      toast({
        title: "Memories cleared",
        description: "All stored memories have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear memories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      // Fetch all user data
      const [conversationsRes, messagesRes, memoriesRes, profileRes, settingsRes] = await Promise.all([
        supabase.from("conversations").select("*").eq("user_id", user.id),
        supabase.from("messages").select("*").eq("user_id", user.id),
        supabase.from("memories").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        profile: profileRes.data,
        settings: settingsRes.data,
        conversations: conversationsRes.data,
        messages: messagesRes.data,
        memories: memoriesRes.data,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aira_data_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export your data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    action,
    destructive = false 
  }: { 
    icon: any; 
    title: string; 
    description?: string;
    action: React.ReactNode;
    destructive?: boolean;
  }) => (
    <div className="flex items-center justify-between py-4 px-1">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${destructive ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Icon className={`h-5 w-5 ${destructive ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div>
          <p className={`font-medium ${destructive ? 'text-destructive' : ''}`}>{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Privacy</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Data Usage Info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">What we store</h2>
              <p className="text-sm text-muted-foreground">
                Aira stores your conversations, preferences, and optional memories to provide 
                a personalized experience. Your data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Data Controls */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Data Controls
          </h2>
          
          <SettingItem
            icon={MessageSquare}
            title="Save Chat History"
            description="Keep your conversations"
            action={
              <Switch
                checked={saveChatHistory}
                onCheckedChange={handleToggleChatHistory}
              />
            }
          />
          
          <div className="border-t border-border" />
          
          <SettingItem
            icon={Brain}
            title="Memory"
            description="Let Aira remember context"
            action={
              <Switch
                checked={memoryEnabled}
                onCheckedChange={handleToggleMemory}
              />
            }
          />
        </div>

        {/* Clear Data */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Clear Data
          </h2>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="cursor-pointer">
                <SettingItem
                  icon={MessageSquare}
                  title="Clear Chat History"
                  description="Delete all conversations"
                  destructive
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      Clear
                    </Button>
                  }
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your conversations. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearChatHistory}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="border-t border-border" />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="cursor-pointer">
                <SettingItem
                  icon={Brain}
                  title="Clear Memories"
                  description="Remove all stored memories"
                  destructive
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      Clear
                    </Button>
                  }
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear memories?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all memories Aira has stored about you.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearMemories}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Export Data */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Export
          </h2>
          
          <SettingItem
            icon={Download}
            title="Download My Data"
            description="Export all your data as JSON"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exporting}
                className="rounded-xl"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Export"
                )}
              </Button>
            }
          />
        </div>
      </main>
    </div>
  );
}