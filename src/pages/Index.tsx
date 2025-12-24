import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useChatFolders } from "@/hooks/useChatFolders";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { EmptyState } from "@/components/chat/EmptyState";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { cn } from "@/lib/utils";

const Index = () => {
  const {
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
    setInputValue,
    inputValue,
  } = useChat();

  const {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useChatFolders();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showTyping = isLoading && messages[messages.length - 1]?.role === "user";

  // When suggestion is clicked, just fill the input - don't send
  const handleSuggestionClick = useCallback((placeholder: string) => {
    setInputValue(placeholder);
  }, [setInputValue]);

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out shrink-0",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          folders={folders}
          onNewChat={createNewConversation}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
          onMoveToFolder={moveToFolder}
          onTogglePin={togglePin}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <ChatHeader
          onClear={clearMessages}
          hasMessages={messages.length > 0}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showSidebarToggle
        />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {showTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <ChatInput 
          onSend={sendMessage} 
          isLoading={isLoading} 
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
};

export default Index;
