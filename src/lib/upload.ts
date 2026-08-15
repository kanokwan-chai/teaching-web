import imageCompression from 'browser-image-compression';

/**
 * Uploads an image file to Cloudinary and returns the URL.
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local
 */
export async function uploadImage(file: File, folder: string = "teaching-practicum"): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.");
  }

  // Compress image before upload
  const options = {
    maxSizeMB: 1, // Max 1MB
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  
  let compressedFile = file;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.warn("Image compression failed, using original file", error);
  }

  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}
