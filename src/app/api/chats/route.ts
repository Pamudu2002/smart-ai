import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/models/Chat";
import { v4 as uuidv4 } from "uuid";

// GET /api/chats — list all chats
export async function GET() {
    try {
        await dbConnect();
        const chats = await Chat.find({}).sort({ updatedAt: -1 }).lean();
        return NextResponse.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json(
            { error: "Failed to fetch chats" },
            { status: 500 }
        );
    }
}

// POST /api/chats — create a new chat
export async function POST() {
    try {
        await dbConnect();
        const chatId = uuidv4();
        const chat = await Chat.create({
            chatId,
            title: "New Chat",
        });
        return NextResponse.json(chat, { status: 201 });
    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json(
            { error: "Failed to create chat" },
            { status: 500 }
        );
    }
}
