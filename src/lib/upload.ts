import imageCompression from 'browser-image-compression';

/**
 * Uploads an image file to local public/uploads directory.
 * If running in a read-only environment (e.g. Vercel production),
 * automatically falls back to compressed Base64 Data URL.
 */
export async function uploadImage(file: File, folder: string = "general"): Promise<string> {
  let fileToUpload = file;
  if (typeof window !== "undefined") {
    const options = {
      maxSizeMB: 0.4, // Max 400KB for fast payload & base64
      maxWidthOrHeight: 1280,
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

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url && !data.error) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn("Local upload endpoint failed, converting to Base64 Data URL:", err);
  }

  // Fallback to Base64 Data URL for serverless platforms like Vercel
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to Data URL"));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(fileToUpload);
  });
}
