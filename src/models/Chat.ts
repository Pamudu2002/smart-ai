import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
    chatId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        chatId: { type: String, required: true, unique: true, index: true },
        title: { type: String, default: "New Chat" },
    },
    { timestamps: true }
);

const Chat: Model<IChat> =
    mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
