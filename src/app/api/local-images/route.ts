import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "";
    const isRecursive = searchParams.get("recursive") === "true" || folder === "logs" || folder === "all" || folder === "";

    // Prevent path traversal
    const safeFolder = folder
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "");

    const baseUploads = path.join(process.cwd(), "public", "uploads");
    const targetDir = path.join(baseUploads, safeFolder);

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ images: [], tree: {}, success: true });
    }

    const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
    const images: any[] = [];
    const tree: Record<string, any[]> = {};

    function scanDir(currentDir: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (isRecursive) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (validExtensions.includes(ext)) {
            const relativeFromUploads = path
              .relative(baseUploads, fullPath)
              .replace(/\\/g, "/");
            const relDir = path.dirname(relativeFromUploads).replace(/\\/g, "/");

            // Extract term and week number if present
            let term = 1;
            if (relativeFromUploads.includes("term-2")) term = 2;
            else if (relativeFromUploads.includes("term-1")) term = 1;

            let weekNumber = null;
            const weekMatch = relativeFromUploads.match(/week-(\d+)/i);
            if (weekMatch) weekNumber = Number(weekMatch[1]);

            const item = {
              id: `local_${relativeFromUploads.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
              url: `/uploads/${relativeFromUploads}`,
              name: entry.name,
              folder: relDir,
              term,
              weekNumber,
            };

            images.push(item);

            if (!tree[relDir]) {
              tree[relDir] = [];
            }
            tree[relDir].push(item);
          }
        }
      }
    }

    scanDir(targetDir);

    return NextResponse.json(
      { images, tree, success: true },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Error reading local images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan local folder", images: [], tree: {} },
      { status: 500 }
    );
  }
}
