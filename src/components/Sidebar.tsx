"use client";

import { useState } from "react";

interface Chat {
    chatId: string;
    title: string;
    updatedAt: string;
}

interface SidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    onRenameChat: (chatId: string, newTitle: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onRenameChat,
    isOpen,
    onToggle,
}: SidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const handleRenameSubmit = (chatId: string) => {
        if (editTitle.trim()) {
            onRenameChat(chatId, editTitle.trim());
        }
        setEditingId(null);
    };

    const startEditing = (chat: Chat) => {
        setEditingId(chat.chatId);
        setEditTitle(chat.title);
    };

    return (
        <>
            {/* Mobile overlay — closes sidebar when tapping outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed md:relative z-50 h-full flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-72"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-text-primary text-sm truncate">Smart AI</span>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-3 shrink-0">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition-all duration-200 text-sm font-medium group"
                    >
                        <svg
                            className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {chats.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <div className="text-text-muted text-sm">No conversations yet</div>
                            <div className="text-text-muted text-xs mt-1">Start a new chat to begin</div>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {chats.map((chat) => (
                                <div
                                    key={chat.chatId}
                                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 animate-slide-in-left ${activeChatId === chat.chatId
                                            ? "bg-surface-active text-text-primary"
                                            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                        }`}
                                    onClick={() => onSelectChat(chat.chatId)}
                                >
                                    <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>

                                    {editingId === chat.chatId ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={() => handleRenameSubmit(chat.chatId)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleRenameSubmit(chat.chatId);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                            className="flex-1 bg-transparent text-sm border-b border-accent outline-none text-text-primary"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="flex-1 text-sm truncate">{chat.title}</span>
                                    )}

                                    {/* Action buttons — always visible on mobile (touch-friendly), hover-only on desktop */}
                                    {editingId !== chat.chatId && (
                                        <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${activeChatId === chat.chatId
                                                ? "opacity-100"
                                                : "opacity-0 group-hover:opacity-100"
                                            }`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(chat);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors touch-manipulation"
                                                title="Rename"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteChat(chat.chatId);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors touch-manipulation"
                                                title="Delete"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border shrink-0">
                    <div className="text-xs text-text-muted text-center">
                        Powered by Google Gemini
                    </div>
                </div>
            </aside>
        </>
    );
}
