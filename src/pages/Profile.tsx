import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  Settings,
  User,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
  const [activeTab, setActiveTab] = useState<"chats" | "pdfs" | "preferences">("chats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [conversationsRes, profileRes] = await Promise.all([
        supabase
          .from("conversations")
          .select("id, title, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single(),
      ]);
      
      if (conversationsRes.data) {
        setConversations(conversationsRes.data);
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ 
    tab, 
    icon: Icon, 
    label 
  }: { 
    tab: "chats" | "pdfs" | "preferences"; 
    icon: any; 
    label: string 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
        activeTab === tab
          ? "text-primary border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="rounded-xl"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border">
          <button 
            onClick={() => navigate("/account")}
            className="relative mb-4 group"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-medium">Edit</span>
            </div>
          </button>
          <h2 className="text-xl font-semibold">
            {profile.display_name || user?.email?.split('@')[0] || "User"}
          </h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Joined {user?.created_at ? format(new Date(user.created_at), "MMM yyyy") : "Recently"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <TabButton tab="chats" icon={MessageSquare} label="Chats" />
          <TabButton tab="pdfs" icon={FileText} label="PDFs" />
          <TabButton tab="preferences" icon={Settings} label="Preferences" />
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === "chats" && (
            <>
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground/60">Start chatting with Aira</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/?chat=${conv.id}`)}
                    className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(conv.updated_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))
              )}
            </>
          )}

          {activeTab === "pdfs" && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No exported PDFs yet</p>
              <p className="text-sm text-muted-foreground/60">
                Ask Aira to export a conversation as PDF
              </p>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">App Settings</p>
                  <p className="text-sm text-muted-foreground">Theme, notifications, and more</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}