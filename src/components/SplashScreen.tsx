import { AiraAvatar } from "./AiraAvatar";

interface SplashScreenProps {
  isFadingOut?: boolean;
}

export function SplashScreen({ isFadingOut = false }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-[opacity,transform] duration-500 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        {/* Aira Avatar with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <AiraAvatar size="lg" />
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold gradient-text">Aira</h1>

        {/* Slogan */}
        <div className="text-center space-y-1">
          <p className="text-base text-muted-foreground">
            Think faster. Work smarter.
          </p>
          <p className="text-sm text-muted-foreground/70">
            One place. All answers.
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
