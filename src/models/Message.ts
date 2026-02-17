import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    chatId: string;
    role: "user" | "assistant";
    content: string;
    image?: string | null;
    status: "pending" | "completed" | "error";
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: String, required: true, index: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        image: { type: String, default: null },
        status: {
            type: String,
            enum: ["pending", "completed", "error"],
            default: "completed",
        },
    },
    { timestamps: true }
);

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
