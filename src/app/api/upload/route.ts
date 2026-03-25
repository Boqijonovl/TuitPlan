import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename (safe characters only)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = uniqueSuffix + '-' + safeName;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // directory might already exist
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    return NextResponse.json({ fileUrl: `/uploads/${filename}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
