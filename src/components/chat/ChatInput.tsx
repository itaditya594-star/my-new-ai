import { useRef, useEffect, KeyboardEvent, ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Image, X, Loader2, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, images?: string[], webSearch?: boolean) => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
}

export function ChatInput({ onSend, isLoading, inputValue, setInputValue }: ChatInputProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (inputValue && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(inputValue.length, inputValue.length);
    }
  }, [inputValue]);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "hi-IN";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputValue(inputValue + finalTranscript + " ");
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => recognitionRef.current?.stop();
  }, [inputValue, setInputValue]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({ description: "Voice input not supported", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if ((inputValue.trim() || images.length > 0) && !isLoading) {
      onSend(inputValue, images.length > 0 ? images : undefined);
      setImages([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsProcessingImage(true);
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string]);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSend = (inputValue.trim() || images.length > 0) && !isLoading;

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 py-4">
      <div className="mx-auto max-w-3xl">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoading} 
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            {isProcessingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Image className="h-5 w-5" />}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={toggleVoiceInput} 
            className={cn(
              "h-10 w-10 rounded-xl transition-all", 
              isListening 
                ? "bg-destructive/20 text-destructive animate-pulse" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Textarea 
            ref={textareaRef} 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Ask Aira anything..." 
            className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50" 
            rows={1} 
            disabled={isLoading} 
          />
          
          <Button 
            onClick={handleSubmit} 
            disabled={!canSend} 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-xl transition-all", 
              canSend 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/25" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
