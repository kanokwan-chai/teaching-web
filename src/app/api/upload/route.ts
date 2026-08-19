import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitize folder path to prevent path traversal
    const safeFolder = folder
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "");

    const targetDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name) || ".png";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const filename = `${baseName}_${timestamp}${ext}`;

    const filePath = path.join(targetDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFolder ? safeFolder + "/" : ""}${filename}`;

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error: any) {
    console.error("Error uploading file to local folder:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save file locally" },
      { status: 500 }
    );
  }
}
