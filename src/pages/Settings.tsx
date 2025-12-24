import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, accentColors, type AccentColor } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Shield,
  Bell,
  Info,
  LogOut,
  User,
  ChevronRight,
  Loader2,
  Palette,
  Check,
  Pipette,
} from "lucide-react";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor, customColor, setCustomColor } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempCustomColor, setTempCustomColor] = useState(customColor);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "Come back soon.",
    });
    navigate("/auth");
  };

  const handleCustomColorApply = () => {
    setAccentColor("custom");
    setCustomColor(tempCustomColor);
    setShowCustomPicker(false);
    toast({
      title: "Color applied",
      description: "Your custom accent color has been saved.",
    });
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    action,
    onClick,
    destructive = false 
  }: { 
    icon: any; 
    title: string; 
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    destructive?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center justify-between py-4 px-1 ${onClick ? 'hover:bg-accent/50 rounded-xl transition-colors cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${destructive ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Icon className={`h-5 w-5 ${destructive ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div className="text-left">
          <p className={`font-medium ${destructive ? 'text-destructive' : ''}`}>{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </button>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
      {title}
    </h3>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const presetColors = Object.keys(accentColors) as Exclude<AccentColor, "custom">[];

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Profile Section */}
        <button 
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">{profile.display_name || user?.email?.split('@')[0] || "User"}</p>
            <p className="text-sm text-muted-foreground">View your profile</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Personalization */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <SectionHeader title="Personalization" />
          
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium px-1 mb-3">Theme</p>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1 rounded-xl h-10"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1 rounded-xl h-10"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1 rounded-xl h-10"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </Button>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Accent Color</p>
              </div>
              <div className="flex flex-wrap gap-3 px-1">
                {presetColors.map((color) => {
                  const colorValue = accentColors[color].dark;
                  const isSelected = accentColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                        isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: `hsl(${colorValue})` }}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    >
                      {isSelected && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
                
                {/* Custom Color Button */}
                <button
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className={`relative w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/50 transition-all duration-200 flex items-center justify-center ${
                    accentColor === "custom" ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "hover:scale-105 hover:border-foreground"
                  }`}
                  style={accentColor === "custom" ? { backgroundColor: customColor } : {}}
                  title="Custom Color"
                >
                  {accentColor === "custom" ? (
                    <Check className="h-5 w-5 text-white drop-shadow-md" />
                  ) : (
                    <Pipette className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Custom Color Picker Panel */}
              {showCustomPicker && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-4 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl border border-border"
                      style={{ backgroundColor: tempCustomColor }}
                    />
                    <div className="flex-1 space-y-2">
                      <label className="text-sm text-muted-foreground">Enter hex color</label>
                      <Input
                        type="text"
                        value={tempCustomColor}
                        onChange={(e) => setTempCustomColor(e.target.value)}
                        placeholder="#ec4899"
                        className="h-10 rounded-xl font-mono"
                        maxLength={7}
                      />
                    </div>
                    <input
                      type="color"
                      value={tempCustomColor}
                      onChange={(e) => setTempCustomColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomPicker(false)}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCustomColorApply}
                      className="flex-1 rounded-xl"
                    >
                      Apply Color
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <SectionHeader title="Notifications" />
          
          <SettingItem
            icon={Bell}
            title="Push Notifications"
            description="Get notified about updates"
            action={
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            }
          />
        </div>

        {/* Account & Privacy */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <SectionHeader title="Account & Privacy" />
          
          <SettingItem
            icon={User}
            title="Account"
            description="Manage your account"
            onClick={() => navigate("/account")}
            action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
          
          <div className="border-t border-border" />
          
          <SettingItem
            icon={Shield}
            title="Privacy"
            description="Manage your data and privacy"
            onClick={() => navigate("/privacy")}
            action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <SectionHeader title="About" />
          
          <SettingItem
            icon={Info}
            title="About Aira"
            description="Version 1.0.0"
            onClick={() => navigate("/about")}
            action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>

        <p className="text-center text-xs text-muted-foreground pb-8">
          Made with care by the Aira Team
        </p>
      </main>
    </div>
  );
}