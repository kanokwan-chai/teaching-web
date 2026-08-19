import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "";

    // Prevent path traversal
    const safeFolder = folder
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "");

    const targetDir = path.join(process.cwd(), "public", "uploads", safeFolder);

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ images: [], success: true });
    }

    const files = fs.readdirSync(targetDir);
    const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        const stat = fs.statSync(path.join(targetDir, file));
        return stat.isFile() && validExtensions.includes(ext);
      })
      .map((file, index) => {
        const publicPath = `/uploads/${safeFolder ? safeFolder + "/" : ""}${file}`;
        return {
          id: `local_${index}_${file}`,
          url: publicPath,
          name: file,
          term: safeFolder.includes("term-2") ? 2 : 1,
        };
      });

    return NextResponse.json({ images, success: true });
  } catch (error: any) {
    console.error("Error reading local images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan local folder", images: [] },
      { status: 500 }
    );
  }
}
