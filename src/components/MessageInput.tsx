"use client";

import { useState, useRef, useCallback } from "react";

interface MessageInputProps {
    onSend: (content: string, image?: string) => void;
    disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setImagePreview(base64);
            setImageBase64(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageSelect(file);
        // Reset input so the same file can be selected again
        e.target.value = "";
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageBase64(null);
    };

    const handleSend = () => {
        if ((!content.trim() && !imageBase64) || disabled) return;

        onSend(content.trim(), imageBase64 || undefined);
        setContent("");
        setImagePreview(null);
        setImageBase64(null);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        // Auto-expand
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
    };

    // Drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageSelect(file);
    };

    return (
        <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
                {/* Image preview */}
                {imagePreview && (
                    <div className="mb-3 animate-fade-in-up">
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Upload preview"
                                className="h-16 sm:h-20 w-auto rounded-lg border border-border object-cover"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-white hover:bg-danger-hover transition-colors shadow-lg touch-manipulation"
                                aria-label="Remove image"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Input area */}
                <div
                    className={`flex items-end gap-1 sm:gap-2 rounded-2xl border bg-background/50 px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 ${isDragging
                            ? "border-accent bg-accent/5"
                            : "border-border focus-within:border-accent/50"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Image upload button (from gallery/files) */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="p-2 rounded-xl text-text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200 disabled:opacity-40 shrink-0 mb-0.5 touch-manipulation"
                        title="Upload image from files"
                        aria-label="Upload image from files"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Hidden file input for gallery */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Camera capture button — opens camera directly on mobile */}
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={disabled}
                        className="p-2 rounded-xl text-text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200 disabled:opacity-40 shrink-0 mb-0.5 touch-manipulation"
                        title="Take a photo"
                        aria-label="Take a photo with camera"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Hidden camera input — capture="environment" uses the rear camera on mobile */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Text input */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={isDragging ? "Drop image here..." : "Type a message..."}
                        disabled={disabled}
                        rows={1}
                        className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-sm resize-none outline-none max-h-[160px] py-2 leading-relaxed disabled:opacity-40 min-w-0"
                    />

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={disabled || (!content.trim() && !imageBase64)}
                        className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 mb-0.5 active:scale-95 touch-manipulation"
                        title="Send message"
                        aria-label="Send message"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                        </svg>
                    </button>
                </div>

                {/* Help text — hidden on mobile to save space */}
                <div className="hidden sm:block text-center mt-2">
                    <span className="text-xs text-text-muted">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-hover text-text-secondary text-[10px] font-mono">Enter</kbd> to send ·{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-surface-hover text-text-secondary text-[10px] font-mono">Shift+Enter</kbd> for new line
                    </span>
                </div>
            </div>
        </div>
    );
}
