import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) return null

        // upload the file on cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("file is uploaded on cloudinary:", result.url);

        // Remove file from local after upload
        fs.unlinkSync(localFilePath);

        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log('Cloudinary:', error);
        return null;
    }
}

export {uploadOnCloudinary}
