import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

class CloudinaryService {
    public static async uploadImage(
        filePath: string,
    ): Promise<string> {
        try {
            if (!filePath) {
                throw new Error("File path is required for uploading an image.");
            }

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            });
            return uploadResult.secure_url;
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            throw new Error("Image upload to Cloudinary failed.");
        }
    }

    public static async deleteImageById(publicId: string): Promise<boolean> {
        try {
            if (!publicId) {
                throw new Error("Public ID is required for deleting an image.");
            }

            const deletionResult = await cloudinary.uploader.destroy(publicId);
            return deletionResult.result === "ok";
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
            throw new Error("Image deletion from Cloudinary failed.");
        }
    }
}

export default CloudinaryService;
