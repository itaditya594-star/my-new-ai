import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export function useChatFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (user && !hasLoaded) {
      loadFolders();
    }
  }, [user, hasLoaded]);

  const loadFolders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setFolders((data || []).map(f => ({
        id: f.id,
        name: f.name,
        color: f.color,
        createdAt: new Date(f.created_at),
      })));
      setHasLoaded(true);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const createFolder = useCallback(async (name: string, color: string = "violet") => {
    if (!user || !name.trim()) return null;

    const newFolder: ChatFolder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date(),
    };

    try {
      await supabase.from("chat_folders").insert({
        id: newFolder.id,
        user_id: user.id,
        name: newFolder.name,
        color: newFolder.color,
      });

      setFolders(prev => [...prev, newFolder]);
      return newFolder.id;
    } catch (error) {
      console.error("Error creating folder:", error);
      return null;
    }
  }, [user]);

  const renameFolder = useCallback(async (id: string, newName: string) => {
    if (!user || !newName.trim()) return;

    setFolders(prev => prev.map(f => 
      f.id === id ? { ...f, name: newName.trim() } : f
    ));

    try {
      await supabase
        .from("chat_folders")
        .update({ name: newName.trim() })
        .eq("id", id);
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  }, [user]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!user) return;

    setFolders(prev => prev.filter(f => f.id !== id));

    try {
      await supabase.from("chat_folders").delete().eq("id", id);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }, [user]);

  const moveConversationToFolder = useCallback(async (conversationId: string, folderId: string | null) => {
    if (!user) return;

    try {
      await supabase
        .from("conversations")
        .update({ folder_id: folderId })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Error moving conversation:", error);
    }
  }, [user]);

  return {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveConversationToFolder,
  };
}
