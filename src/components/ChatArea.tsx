"use client";

import { useEffect, useRef } from "react";

interface Message {
    _id: string;
    chatId: string;
    role: "user" | "assistant";
    content: string;
    image?: string | null;
    status: string;
    createdAt: string;
}

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
    chatId: string | null;
}

function parseMarkdown(text: string): string {
    // Simple markdown parser for chat messages
    let html = text;

    // Code blocks (``` ... ```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Unordered lists
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks (but not inside code blocks)
    html = html.replace(/(?<!\n)\n(?!\n)/g, '<br/>');

    // Paragraphs for double newlines
    html = html.replace(/\n\n/g, '</p><p>');

    return html;
}

export default function ChatArea({ messages, isLoading, chatId }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    if (!chatId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
                <div className="text-center w-full max-w-md py-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shadow-lg shadow-accent/20">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                        Welcome to Smart AI
                    </h1>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6 px-2">
                        Your intelligent chat assistant powered by Google Gemini.
                        Send text, upload images, and get thoughtful responses.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        {[
                            { icon: "💬", title: "Ask Anything", desc: "Get answers to your questions" },
                            { icon: "🖼️", title: "Image Analysis", desc: "Upload images for AI insights" },
                            { icon: "💡", title: "Creative Ideas", desc: "Brainstorm and explore concepts" },
                            { icon: "📝", title: "Writing Help", desc: "Draft, edit, and improve text" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/50 hover:border-accent/30 transition-colors"
                            >
                                <span className="text-lg shrink-0">{item.icon}</span>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-text-primary">{item.title}</div>
                                    <div className="text-xs text-text-muted">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-3xl mx-auto space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-text-secondary text-sm">
                            Start the conversation by typing a message below
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`flex gap-2 sm:gap-3 animate-fade-in-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {message.role === "assistant" && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shrink-0 mt-1">
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        )}

                        <div
                            className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 min-w-0 ${message.role === "user"
                                    ? "bg-gradient-to-r from-user-bubble to-user-bubble-end text-white rounded-br-md"
                                    : "bg-ai-bubble text-text-primary border border-border/50 rounded-bl-md"
                                }`}
                        >
                            {/* Image preview */}
                            {message.image && (
                                <div className="mb-2">
                                    <img
                                        src={message.image}
                                        alt="Uploaded"
                                        className="max-w-full max-h-48 sm:max-h-64 rounded-lg object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                            )}

                            {/* Message content */}
                            <div
                                className={`message-content text-sm ${message.role === "user" ? "text-white" : ""}`}
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                            />

                            {/* Status indicator */}
                            {message.status === "error" && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-danger">
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Error generating response
                                </div>
                            )}
                        </div>

                        {message.role === "user" && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-active flex items-center justify-center shrink-0 mt-1">
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex gap-2 sm:gap-3 animate-fade-in-up">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-5 py-4 border border-border/50">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-accent typing-dot" />
                                <div className="w-2 h-2 rounded-full bg-accent typing-dot" />
                                <div className="w-2 h-2 rounded-full bg-accent typing-dot" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
