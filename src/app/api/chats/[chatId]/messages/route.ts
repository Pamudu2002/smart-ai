import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { generateResponse } from "@/lib/gemini";

// GET /api/chats/[chatId]/messages — list all messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 })
            .lean();
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// POST /api/chats/[chatId]/messages — send a message & get AI response
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const { content, image } = await request.json();

        if (!content && !image) {
            return NextResponse.json(
                { error: "Content or image is required" },
                { status: 400 }
            );
        }

        // Verify chat exists
        const chat = await Chat.findOne({ chatId });
        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Step 1: Upload image to Cloudinary (if provided)
        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await uploadImage(image);
        }

        // Step 2: Save user message to DB
        const userMessage = await Message.create({
            chatId,
            role: "user",
            content: content || "(Image uploaded)",
            image: imageUrl,
            status: "completed",
        });

        // Step 3: Get conversation history from DB
        const previousMessages = await Message.find({
            chatId,
            status: "completed",
            _id: { $ne: userMessage._id },
        })
            .sort({ createdAt: 1 })
            .lean();

        const history = previousMessages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
            image: msg.image,
        }));

        // Step 4: Send to Gemini API (user is decoupled — we go through DB)
        let aiContent: string;
        try {
            aiContent = await generateResponse(
                history,
                content || "What do you see in this image?",
                imageUrl
            );
        } catch {
            // Save error message
            const errorMessage = await Message.create({
                chatId,
                role: "assistant",
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                status: "error",
            });

            return NextResponse.json({
                userMessage,
                assistantMessage: errorMessage,
            });
        }

        // Step 5: Save AI response to DB
        const assistantMessage = await Message.create({
            chatId,
            role: "assistant",
            content: aiContent,
            status: "completed",
        });

        // Step 6: Delete image from Cloudinary after response is saved
        if (imageUrl) {
            await deleteImage(imageUrl);
            // Update user message to remove image URL since it's been deleted
            // Keep a note that an image was part of this conversation
            await Message.findByIdAndUpdate(userMessage._id, {
                image: imageUrl, // keep the URL for display (thumbnail might still be cached)
            });
        }

        // Step 7: Auto-update chat title if this is the first message
        const messageCount = await Message.countDocuments({ chatId });
        if (messageCount <= 2) {
            // First exchange (user + assistant)
            const title =
                content?.substring(0, 50) || "Image Chat";
            await Chat.findOneAndUpdate({ chatId }, { title });
        }

        // Step 8: Return response from DB (not directly from Gemini)
        const savedResponse = await Message.findById(assistantMessage._id).lean();

        return NextResponse.json({
            userMessage,
            assistantMessage: savedResponse,
        });
    } catch (error) {
        console.error("Error processing message:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}
