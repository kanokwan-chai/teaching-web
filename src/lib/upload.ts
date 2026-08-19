import imageCompression from 'browser-image-compression';

/**
 * Uploads an image file to local public/uploads directory.
 * Returns the public URL path (e.g. /uploads/gallery/term-1/image.jpg)
 */
export async function uploadImage(file: File, folder: string = "general"): Promise<string> {
  // Compress image before upload if client-side
  let fileToUpload = file;
  if (typeof window !== "undefined") {
    const options = {
      maxSizeMB: 1, // Max 1MB
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    try {
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.warn("Image compression failed, using original file", error);
    }
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload image locally");
  }

  const data = await response.json();
  return data.url;
}
