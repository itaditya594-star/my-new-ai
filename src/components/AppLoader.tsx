import { useAuth } from "@/contexts/AuthContext";
import { SplashScreen } from "./SplashScreen";
import { useEffect, useState } from "react";

interface AppLoaderProps {
  children: React.ReactNode;
}

const MIN_DISPLAY_TIME_MS = 1000; // 1 second
const MAX_SPLASH_TIME_MS = 6000; // safety fallback
const FADE_OUT_MS = 500;

export function AppLoader({ children }: AppLoaderProps) {
  const { loading } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [maxTimeElapsed, setMaxTimeElapsed] = useState(false);

  // Minimum display timer
  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_TIME_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Safety fallback timer (prevents getting stuck forever)
  useEffect(() => {
    const timer = window.setTimeout(() => setMaxTimeElapsed(true), MAX_SPLASH_TIME_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Start fade-out when ready (auth done) OR when fallback triggers
  useEffect(() => {
    if (minTimeElapsed && (!loading || maxTimeElapsed)) {
      setIsFadingOut(true);
    }
  }, [minTimeElapsed, loading, maxTimeElapsed]);

  // Remove splash after fade-out
  useEffect(() => {
    if (!isFadingOut) return;
    const timer = window.setTimeout(() => setShowSplash(false), FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [isFadingOut]);

  return (
    <>
      {/* Always render app content to avoid white screen */}
      <div className="min-h-screen bg-background">{children}</div>
      {showSplash && <SplashScreen isFadingOut={isFadingOut} />}
    </>
  );
}
