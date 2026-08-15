import imageCompression from 'browser-image-compression';
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image file to Firebase Storage and returns the URL.
 */
export async function uploadImage(file: File, folder: string = "uploads"): Promise<string> {
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

  // Create unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  try {
    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw new Error("Failed to upload image to Firebase Storage");
  }
}
