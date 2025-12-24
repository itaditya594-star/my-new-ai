import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AiraAvatar } from "@/components/AiraAvatar";
import {
  ArrowLeft,
  Heart,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const APP_VERSION = "1.0.0";

export default function About() {
  const navigate = useNavigate();

  const InfoItem = ({ 
    label, 
    value, 
    action 
  }: { 
    label: string; 
    value: string; 
    action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {action}
      </div>
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
          <h1 className="text-xl font-semibold">About Aira</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <AiraAvatar size="xl" state="happy" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Aira</h2>
          <p className="text-muted-foreground">
            Aira helps you think faster and work smarter.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            One place. All answers.
          </p>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Meet Aira</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aira is a cute, expressive, and human-like AI assistant designed 
                for meaningful conversations. She is warm, playful, and always 
                ready to help you with anything from creative tasks to everyday questions.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                With features like conversation memory, PDF export, and web search, 
                Aira is more than just a chatbot - she is your personal AI companion 
                who remembers and grows with you.
              </p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            App Information
          </h3>
          
          <InfoItem label="Version" value={APP_VERSION} />
          <div className="border-t border-border" />
          <InfoItem label="Build" value="Production" />
          <div className="border-t border-border" />
          <InfoItem label="Platform" value="Web" />
        </div>

        {/* Team */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Made with care</h3>
              <p className="text-sm text-muted-foreground">
                Aira is crafted by a passionate team dedicated to creating 
                meaningful AI experiences that feel personal and delightful.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Contact
          </h3>
          
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-sm">Email</span>
                <span className="text-xs text-muted-foreground">contactaira@zohomail.in</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("mailto:contactaira@zohomail.in", "_blank")}
              className="rounded-xl"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border-t border-border" />
          
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-sm">Phone</span>
                <span className="text-xs text-muted-foreground">+91 9892933619</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("tel:+919892933619", "_blank")}
              className="rounded-xl"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Legal
          </h3>
          
          <button
            onClick={() => toast({ title: "Coming soon" })}
            className="w-full flex items-center justify-between py-3 px-1 hover:bg-accent/50 rounded-xl transition-colors"
          >
            <span>Terms of Service</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="border-t border-border" />
          
          <button
            onClick={() => toast({ title: "Coming soon" })}
            className="w-full flex items-center justify-between py-3 px-1 hover:bg-accent/50 rounded-xl transition-colors"
          >
            <span>Privacy Policy</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          Aira v{APP_VERSION} - Made with love
        </p>
      </main>
    </div>
  );
}

// Quick inline toast for demo
function toast({ title }: { title: string }) {
  // This is a placeholder - actual toast is imported in real use
  console.log(title);
}