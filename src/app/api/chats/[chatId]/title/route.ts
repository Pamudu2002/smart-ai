import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/models/Chat";

// PATCH /api/chats/[chatId]/title — rename a chat
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const { title } = await request.json();

        if (!title || typeof title !== "string") {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        const chat = await Chat.findOneAndUpdate(
            { chatId },
            { title: title.trim() },
            { new: true }
        ).lean();

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Error updating chat title:", error);
        return NextResponse.json(
            { error: "Failed to update chat title" },
            { status: 500 }
        );
    }
}
