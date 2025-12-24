import { cn } from "@/lib/utils";

interface AiraAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  state?: "idle" | "thinking" | "speaking" | "happy";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function AiraAvatar({ size = "md", state = "idle", className }: AiraAvatarProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 blur-md opacity-30",
        state === "thinking" && "animate-pulse",
        state === "speaking" && "animate-pulse opacity-50"
      )} />
      
      {/* Main avatar container */}
      <div className={cn(
        "relative rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 flex items-center justify-center overflow-hidden shadow-lg border-2 border-rose-100",
        sizeClasses[size],
        state === "thinking" && "animate-pulse"
      )}>
        {/* Face container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Hair */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[40%] rounded-t-full bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900" />
          
          {/* Bangs - adjusted for each size */}
          <div className="absolute flex justify-center w-full" style={{ top: size === "sm" ? "12%" : size === "md" ? "12%" : size === "lg" ? "10%" : "10%" }}>
            <div 
              className="bg-gradient-to-b from-amber-700 to-amber-800 rounded-b-full transform -rotate-6"
              style={{ 
                width: size === "sm" ? "5px" : size === "md" ? "6px" : size === "lg" ? "10px" : "14px", 
                height: size === "sm" ? "6px" : size === "md" ? "7px" : size === "lg" ? "12px" : "18px" 
              }} 
            />
            <div 
              className="bg-gradient-to-b from-amber-700 to-amber-800 rounded-b-full mx-0.5"
              style={{ 
                width: size === "sm" ? "6px" : size === "md" ? "8px" : size === "lg" ? "12px" : "16px", 
                height: size === "sm" ? "8px" : size === "md" ? "9px" : size === "lg" ? "14px" : "22px" 
              }} 
            />
            <div 
              className="bg-gradient-to-b from-amber-700 to-amber-800 rounded-b-full transform rotate-6"
              style={{ 
                width: size === "sm" ? "5px" : size === "md" ? "6px" : size === "lg" ? "10px" : "14px", 
                height: size === "sm" ? "6px" : size === "md" ? "7px" : size === "lg" ? "12px" : "18px" 
              }} 
            />
          </div>
          
          {/* Face skin */}
          <div 
            className="absolute bg-gradient-to-b from-rose-50 to-rose-100 rounded-full"
            style={{
              width: size === "sm" ? "22px" : size === "md" ? "26px" : size === "lg" ? "42px" : "62px",
              height: size === "sm" ? "18px" : size === "md" ? "22px" : size === "lg" ? "36px" : "54px",
              top: size === "sm" ? "30%" : size === "md" ? "28%" : size === "lg" ? "26%" : "24%"
            }}
          />
          
          {/* Eyes container */}
          <div 
            className="absolute flex items-center justify-center"
            style={{ 
              top: size === "sm" ? "44%" : size === "md" ? "42%" : size === "lg" ? "40%" : "40%",
              gap: size === "sm" ? "8px" : size === "md" ? "10px" : size === "lg" ? "16px" : "22px"
            }}
          >
            {/* Left eye */}
            <div 
              className={cn(
                "relative rounded-full",
                state === "happy" ? "bg-amber-900 scale-y-50" : "bg-gradient-to-b from-amber-800 to-amber-950"
              )}
              style={{ 
                width: size === "sm" ? "4px" : size === "md" ? "5px" : size === "lg" ? "8px" : "11px",
                height: size === "sm" ? "5px" : size === "md" ? "6px" : size === "lg" ? "10px" : "14px"
              }}
            >
              {state !== "happy" && (
                <div 
                  className="absolute bg-white rounded-full"
                  style={{
                    width: size === "sm" ? "1.5px" : size === "md" ? "2px" : size === "lg" ? "3px" : "4px",
                    height: size === "sm" ? "1.5px" : size === "md" ? "2px" : size === "lg" ? "3px" : "4px",
                    top: "15%",
                    left: "20%"
                  }}
                />
              )}
            </div>
            
            {/* Right eye */}
            <div 
              className={cn(
                "relative rounded-full",
                state === "happy" ? "bg-amber-900 scale-y-50" : "bg-gradient-to-b from-amber-800 to-amber-950"
              )}
              style={{ 
                width: size === "sm" ? "4px" : size === "md" ? "5px" : size === "lg" ? "8px" : "11px",
                height: size === "sm" ? "5px" : size === "md" ? "6px" : size === "lg" ? "10px" : "14px"
              }}
            >
              {state !== "happy" && (
                <div 
                  className="absolute bg-white rounded-full"
                  style={{
                    width: size === "sm" ? "1.5px" : size === "md" ? "2px" : size === "lg" ? "3px" : "4px",
                    height: size === "sm" ? "1.5px" : size === "md" ? "2px" : size === "lg" ? "3px" : "4px",
                    top: "15%",
                    left: "20%"
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Blush */}
          <div 
            className="absolute flex items-center justify-center"
            style={{ 
              top: size === "sm" ? "54%" : size === "md" ? "52%" : size === "lg" ? "50%" : "50%",
              gap: size === "sm" ? "14px" : size === "md" ? "18px" : size === "lg" ? "28px" : "40px"
            }}
          >
            <div 
              className="rounded-full bg-rose-300/50"
              style={{ 
                width: size === "sm" ? "4px" : size === "md" ? "5px" : size === "lg" ? "8px" : "12px",
                height: size === "sm" ? "2px" : size === "md" ? "2.5px" : size === "lg" ? "4px" : "6px"
              }}
            />
            <div 
              className="rounded-full bg-rose-300/50"
              style={{ 
                width: size === "sm" ? "4px" : size === "md" ? "5px" : size === "lg" ? "8px" : "12px",
                height: size === "sm" ? "2px" : size === "md" ? "2.5px" : size === "lg" ? "4px" : "6px"
              }}
            />
          </div>
          
          {/* Mouth */}
          <div 
            className={cn(
              "absolute rounded-full",
              state === "speaking" ? "animate-pulse" : "",
              state === "happy" ? "bg-transparent border-b-2 border-amber-900 rounded-none" : "bg-rose-400"
            )}
            style={{ 
              top: size === "sm" ? "62%" : size === "md" ? "60%" : size === "lg" ? "58%" : "58%",
              width: state === "happy" 
                ? (size === "sm" ? "5px" : size === "md" ? "6px" : size === "lg" ? "10px" : "14px")
                : (size === "sm" ? "3px" : size === "md" ? "4px" : size === "lg" ? "6px" : "8px"),
              height: state === "happy" 
                ? "0" 
                : (size === "sm" ? "2px" : size === "md" ? "2px" : size === "lg" ? "3px" : "4px"),
              borderBottomWidth: state === "happy" ? (size === "sm" ? "1px" : "2px") : "0"
            }}
          />
        </div>
      </div>
    </div>
  );
}
