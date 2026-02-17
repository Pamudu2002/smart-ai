import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Data: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Data, {
        folder: "smart-ai-chats",
        resource_type: "image",
    });
    return result.secure_url;
}

export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract public_id from the URL
        const parts = imageUrl.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return;
        // public_id is everything after upload/v<version>/
        const pathAfterUpload = parts.slice(uploadIndex + 2).join("/");
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ""); // remove file extension
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
    }
}

export default cloudinary;
