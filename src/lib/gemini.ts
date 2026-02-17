import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    image?: string | null;
}

export async function generateResponse(
    messages: ChatMessage[],
    currentPrompt: string,
    imageUrl?: string | null
): Promise<string> {
    // Build conversation history for context
    const contents: Array<{
        role: "user" | "model";
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [];

    // Add previous messages as context
    for (const msg of messages) {
        contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        });
    }

    // Build current message parts
    const currentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (currentPrompt) {
        currentParts.push({ text: currentPrompt });
    }

    // If there's an image URL, fetch it and convert to base64 for the API
    if (imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const contentType = response.headers.get("content-type") || "image/jpeg";
            currentParts.push({
                inlineData: {
                    mimeType: contentType,
                    data: base64,
                },
            });
        } catch (error) {
            console.error("Failed to fetch image for Gemini:", error);
            if (!currentPrompt) {
                currentParts.push({ text: "Please describe any image you see." });
            }
        }
    }

    contents.push({
        role: "user",
        parts: currentParts,
    });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
            config: {
                maxOutputTokens: 8192,
                temperature: 0.7,
            },
        });

        return response.text || "I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate AI response");
    }
}
