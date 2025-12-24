import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: Date;
  isWebSearch?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  folderId: string | null;
  pinned: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // Load conversations from database when user is logged in
  useEffect(() => {
    if (user && !hasLoadedFromDb) {
      loadConversations();
    }
  }, [user, hasLoadedFromDb]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;

      const loadedConversations: Conversation[] = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: msgData } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          return {
            id: conv.id,
            title: conv.title,
            folderId: conv.folder_id || null,
            pinned: conv.pinned || false,
            messages: (msgData || []).map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              images: msg.images || undefined,
              timestamp: new Date(msg.created_at),
            })),
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
          };
        })
      );

      setConversations(loadedConversations);
      setHasLoadedFromDb(true);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const createNewConversation = useCallback(async (folderId?: string | null) => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      folderId: folderId || null,
      pinned: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase.from("conversations").insert({
          id: newConversation.id,
          user_id: user.id,
          title: newConversation.title,
          folder_id: newConversation.folderId,
        });
      } catch (error) {
        console.error("Error saving conversation:", error);
      }
    }

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setInputValue("");
    return newConversation.id;
  }, [user]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    setInputValue("");
  }, []);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle.trim() } : conv
    ));

    if (user) {
      try {
        await supabase
          .from("conversations")
          .update({ title: newTitle.trim() })
          .eq("id", id);
      } catch (error) {
        console.error("Error renaming conversation:", error);
      }
    }
  }, [user]);

  const moveToFolder = useCallback(async (conversationId: string, folderId: string | null) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, folderId } : conv
    ));

    if (user) {
      try {
        await supabase
          .from("conversations")
          .update({ folder_id: folderId })
          .eq("id", conversationId);
      } catch (error) {
        console.error("Error moving conversation:", error);
      }
    }
  }, [user]);

  const togglePin = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const newPinned = !conv.pinned;
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, pinned: newPinned } : c
    ));

    if (user) {
      try {
        await supabase
          .from("conversations")
          .update({ pinned: newPinned })
          .eq("id", conversationId);
      } catch (error) {
        console.error("Error toggling pin:", error);
      }
    }
  }, [user, conversations]);

  const deleteConversation = useCallback(async (id: string) => {
    if (user) {
      try {
        await supabase.from("conversations").delete().eq("id", id);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }

    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setInputValue("");
    }
  }, [currentConversationId, user]);

  const sendMessage = useCallback(async (input: string, images?: string[], webSearch?: boolean) => {
    if ((!input.trim() && (!images || images.length === 0)) || isLoading) return;

    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createNewConversation();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      images,
      timestamp: new Date(),
      isWebSearch: webSearch,
    };

    // Check if this is the first message BEFORE updating state
    const currentConv = conversations.find(c => c.id === conversationId);
    const isFirstMessage = !currentConv || currentConv.messages.length === 0;
    const newTitle = (input.trim().slice(0, 30) || "Image question") + (input.trim().length > 30 ? "..." : "");

    // Update conversation with user message and title
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          title: isFirstMessage ? newTitle : conv.title,
          messages: [...conv.messages, userMessage],
          updatedAt: new Date(),
        };
      }
      return conv;
    }));

    // Save user message to database
    if (user && conversationId) {
      try {
        await supabase.from("messages").insert({
          id: userMessage.id,
          conversation_id: conversationId,
          user_id: user.id,
          role: "user",
          content: userMessage.content,
          images: userMessage.images || null,
        });

        // Update conversation title if first message
        if (isFirstMessage) {
          await supabase
            .from("conversations")
            .update({ title: newTitle })
            .eq("id", conversationId);
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }

    setIsLoading(true);
    setInputValue("");
    let assistantContent = "";

    try {
      // Build message content for API
      const apiMessages = [...messages, userMessage].map(m => {
        if (m.images && m.images.length > 0) {
          const content: MessageContent[] = [];
          if (m.content) {
            content.push({ type: "text", text: m.content });
          }
          m.images.forEach(img => {
            content.push({ type: "image_url", image_url: { url: img } });
          });
          return { role: m.role, content };
        }
        return { role: m.role, content: m.content };
      });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          webSearch: webSearch || false,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${resp.status}`);
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      const assistantId = crypto.randomUUID();

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  if (lastMsg?.role === "assistant" && lastMsg.id === assistantId) {
                    return {
                      ...conv,
                      messages: conv.messages.map((m, i) =>
                        i === conv.messages.length - 1 ? { ...m, content: assistantContent } : m
                      ),
                    };
                  }
                  return {
                    ...conv,
                    messages: [...conv.messages, {
                      id: assistantId,
                      role: "assistant",
                      content: assistantContent,
                      timestamp: new Date(),
                    }],
                  };
                }
                return conv;
              }));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  if (lastMsg?.role === "assistant") {
                    return {
                      ...conv,
                      messages: conv.messages.map((m, i) =>
                        i === conv.messages.length - 1 ? { ...m, content: assistantContent } : m
                      ),
                    };
                  }
                }
                return conv;
              }));
            }
          } catch {
            // ignore partial leftovers
          }
        }
      }

      // Save assistant message to database
      if (user && conversationId && assistantContent) {
        try {
          await supabase.from("messages").insert({
            id: assistantId,
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: assistantContent,
          });
        } catch (error) {
          console.error("Error saving assistant message:", error);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Oops! Something went wrong 😅",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      // Remove the user message if the request failed
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.filter(m => m.id !== userMessage.id),
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentConversationId, createNewConversation, user, conversations]);

  const clearMessages = useCallback(async () => {
    if (currentConversationId) {
      if (user) {
        try {
          await supabase
            .from("messages")
            .delete()
            .eq("conversation_id", currentConversationId);
          
          await supabase
            .from("conversations")
            .update({ title: "New Chat" })
            .eq("id", currentConversationId);
        } catch (error) {
          console.error("Error clearing messages:", error);
        }
      }

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return { ...conv, messages: [], title: "New Chat" };
        }
        return conv;
      }));
    }
    setInputValue("");
  }, [currentConversationId, user]);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    clearMessages,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    moveToFolder,
    togglePin,
    inputValue,
    setInputValue,
  };
}