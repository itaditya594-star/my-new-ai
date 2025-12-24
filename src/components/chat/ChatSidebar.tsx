import { useState } from "react";
import { 
  Plus, MessageSquare, Trash2, User, MoreHorizontal, Search, 
  Pencil, Check, X, FolderPlus, Folder, ChevronRight, ChevronDown,
  Pin, PinOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Conversation } from "@/hooks/useChat";
import type { ChatFolder } from "@/hooks/useChatFolders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const FOLDER_COLORS = [
  { name: "violet", class: "bg-violet-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "green", class: "bg-green-500" },
  { name: "yellow", class: "bg-yellow-500" },
  { name: "red", class: "bg-red-500" },
  { name: "pink", class: "bg-pink-500" },
];

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  folders: ChatFolder[];
  onNewChat: (folderId?: string | null) => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onTogglePin: (conversationId: string) => void;
  onCreateFolder: (name: string, color: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onCloseSidebar?: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  folders,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onMoveToFolder,
  onTogglePin,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onCloseSidebar,
}: ChatSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("violet");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [draggedConvId, setDraggedConvId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate pinned and unpinned conversations
  const pinnedConversations = filteredConversations.filter(c => c.pinned && !c.folderId);
  const unfolderConversations = filteredConversations.filter(c => !c.folderId && !c.pinned);
  
  const getFolderConversations = (folderId: string) => 
    filteredConversations.filter(c => c.folderId === folderId);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle);
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName("");
      setNewFolderColor("violet");
      setShowNewFolderDialog(false);
    }
  };

  const getFolderColorClass = (color: string) => {
    return FOLDER_COLORS.find(c => c.name === color)?.class || "bg-violet-500";
  };

  // Native drag handlers
  const handleDragStart = (e: React.DragEvent, convId: string) => {
    setDraggedConvId(convId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", convId);
  };

  const handleDragEnd = () => {
    setDraggedConvId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (draggedConvId) {
      onMoveToFolder(draggedConvId, folderId);
      if (folderId) {
        setExpandedFolders(prev => new Set([...prev, folderId]));
      }
    }
    setDraggedConvId(null);
    setDragOverFolderId(null);
  };

  const renderConversation = (conv: Conversation) => (
    <div
      key={conv.id}
      draggable
      onDragStart={(e) => handleDragStart(e, conv.id)}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer",
        currentConversationId === conv.id
          ? "bg-primary/10 text-foreground border border-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        draggedConvId === conv.id && "opacity-50"
      )}
      onClick={() => {
        if (editingId !== conv.id) {
          onSelectConversation(conv.id);
          onCloseSidebar?.();
        }
      }}
    >
      {conv.pinned && (
        <Pin className="h-3 w-3 text-primary shrink-0" />
      )}
      
      <MessageSquare className={cn(
        "h-4 w-4 shrink-0",
        currentConversationId === conv.id ? "text-primary" : "text-muted-foreground"
      )} />
      
      {editingId === conv.id ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-6 text-sm px-2 py-0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename(conv.id);
              if (e.key === "Escape") handleCancelRename();
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => handleSaveRename(conv.id)}
          >
            <Check className="h-3 w-3 text-green-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleCancelRename}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate font-medium">{conv.title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onTogglePin(conv.id)}>
                {conv.pinned ? (
                  <>
                    <PinOff className="h-3.5 w-3.5 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-3.5 w-3.5 mr-2" />
                    Pin to top
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStartRename(conv)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Folder className="h-3.5 w-3.5 mr-2" />
                  Move to folder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onMoveToFolder(conv.id, null)}>
                    <X className="h-3.5 w-3.5 mr-2" />
                    No folder
                  </DropdownMenuItem>
                  {folders.length > 0 && <DropdownMenuSeparator />}
                  {folders.map(folder => (
                    <DropdownMenuItem 
                      key={folder.id} 
                      onClick={() => onMoveToFolder(conv.id, folder.id)}
                    >
                      <div className={cn("h-3 w-3 rounded mr-2", getFolderColorClass(folder.color))} />
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteConversation(conv.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Profile section */}
      <div className="p-4 border-b border-sidebar-border">
        <button 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-sidebar-accent transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium truncate">
              {user?.phone || user?.user_metadata?.display_name || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </button>
      </div>

      {/* New chat button */}
      <div className="p-3 flex gap-2">
        <Button
          onClick={() => {
            onNewChat();
            onCloseSidebar?.();
          }}
          className="flex-1 justify-start gap-2 gradient-bg text-white hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowNewFolderDialog(true)}
          className="shrink-0"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      {/* Chats section */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Chats
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {/* Pinned conversations */}
          {pinnedConversations.length > 0 && (
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 px-2 py-1">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Pinned</span>
              </div>
              {pinnedConversations.map(renderConversation)}
            </div>
          )}

          {/* Folders */}
          {folders.map(folder => {
            const folderConvs = getFolderConversations(folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            const isDragOver = dragOverFolderId === folder.id;
            
            return (
              <div 
                key={folder.id} 
                className="space-y-1"
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <div 
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent/50 transition-colors",
                    isDragOver && "bg-primary/20 border-2 border-dashed border-primary"
                  )}
                  onClick={() => toggleFolder(folder.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className={cn("h-3 w-3 rounded", getFolderColorClass(folder.color))} />
                  
                  {editingFolderId === folder.id ? (
                    <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        className="h-6 text-sm px-2 py-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onRenameFolder(folder.id, editFolderName);
                            setEditingFolderId(null);
                          }
                          if (e.key === "Escape") setEditingFolderId(null);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          onRenameFolder(folder.id, editFolderName);
                          setEditingFolderId(null);
                        }}
                      >
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate font-medium">{folder.name}</span>
                      <span className="text-xs text-muted-foreground">{folderConvs.length}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingFolderId(folder.id);
                            setEditFolderName(folder.name);
                          }}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onNewChat(folder.id)}>
                            <Plus className="h-3.5 w-3.5 mr-2" />
                            New chat here
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteFolder(folder.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {folderConvs.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-3 py-2">Empty folder</p>
                    ) : (
                      folderConvs.map(renderConversation)
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unfiled conversations drop zone */}
          <div
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => handleDrop(e, null)}
            className={cn(
              "transition-colors rounded-xl",
              dragOverFolderId === null && draggedConvId && "bg-primary/10 border-2 border-dashed border-primary p-2"
            )}
          >
            {unfolderConversations.length === 0 && folders.length === 0 && pinnedConversations.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? "No chats found" : "No chats yet"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {searchQuery ? "Try a different search" : "Start a new conversation"}
                </p>
              </div>
            ) : (
              unfolderConversations.map(renderConversation)
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Ready</span>
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              {FOLDER_COLORS.map(color => (
                <button
                  key={color.name}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color.class,
                    newFolderColor === color.name && "ring-2 ring-offset-2 ring-primary"
                  )}
                  onClick={() => setNewFolderColor(color.name)}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
