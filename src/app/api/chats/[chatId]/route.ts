import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { deleteImage } from "@/lib/cloudinary";

// GET /api/chats/[chatId] — get chat details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const chat = await Chat.findOne({ chatId }).lean();
        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }
        return NextResponse.json(chat);
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat" },
            { status: 500 }
        );
    }
}

// DELETE /api/chats/[chatId] — delete a chat and its messages
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;

        // Delete images from Cloudinary before deleting messages
        const messagesWithImages = await Message.find({
            chatId,
            image: { $ne: null },
        }).lean();

        for (const msg of messagesWithImages) {
            if (msg.image) {
                await deleteImage(msg.image);
            }
        }

        await Message.deleteMany({ chatId });
        await Chat.deleteOne({ chatId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 }
        );
    }
}
