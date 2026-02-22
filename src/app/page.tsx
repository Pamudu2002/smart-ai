"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";

interface Chat {
  chatId: string;
  title: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  image?: string | null;
  status: string;
  createdAt: string;
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Default to closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set initial sidebar state based on screen width (client-side only)
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  // Fetch messages for active chat
  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, fetchMessages]);

  // Create new chat
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chats", { method: "POST" });
      const chat = await res.json();
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.chatId);
      setMessages([]);
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Select a chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Delete a chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.chatId !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Rename a chat
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const updatedChat = await res.json();
      setChats((prev) =>
        prev.map((c) => (c.chatId === chatId ? { ...c, title: updatedChat.title } : c))
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  // Send a message
  const handleSendMessage = async (content: string, image?: string) => {
    if (!activeChatId) {
      // Auto-create a chat if none selected
      try {
        const res = await fetch("/api/chats", { method: "POST" });
        const chat = await res.json();
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(chat.chatId);
        await sendMessage(chat.chatId, content, image);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
      return;
    }

    await sendMessage(activeChatId, content, image);
  };

  const sendMessage = async (chatId: string, content: string, image?: string) => {
    // Optimistic update - add user message immediately
    const tempUserMsg: Message = {
      _id: "temp-user-" + Date.now(),
      chatId,
      role: "user",
      content: content || "(Image uploaded)",
      image: image || null,
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Replace temp message with actual DB message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempUserMsg._id);
        return [...filtered, data.userMessage, data.assistantMessage];
      });

      // Refresh chat list to update title/timestamp
      fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message and show error
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempUserMsg._id);
        return [
          ...filtered,
          {
            ...tempUserMsg,
            _id: "real-" + tempUserMsg._id,
          },
          {
            _id: "error-" + Date.now(),
            chatId,
            role: "assistant" as const,
            content: "Sorry, something went wrong. Please check your API keys and try again.",
            status: "error",
            createdAt: new Date().toISOString(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0 bg-surface/50 backdrop-blur-xl">
          {/* Hamburger — always shown so mobile users can always open sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              /* X icon when sidebar is open */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon when sidebar is closed */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-text-primary truncate">
              {activeChatId
                ? chats.find((c) => c.chatId === activeChatId)?.title || "Chat"
                : "Smart AI"}
            </h2>
            {activeChatId && (
              <p className="text-xs text-text-muted">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {activeChatId && (
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </header>

        {/* Chat area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          chatId={activeChatId}
        />

        {/* Message input */}
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}
