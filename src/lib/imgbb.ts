import imageCompression from 'browser-image-compression';

/**
 * Uploads an image file to ImgBB and returns the URL.
 * Requires NEXT_PUBLIC_IMGBB_API_KEY to be set in .env.local
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing ImgBB API Key. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file.");
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
  formData.append("image", compressedFile);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload image to ImgBB");
  }

  const data = await response.json();
  return data.data.url; // ImgBB returns the URL in data.data.url
}
