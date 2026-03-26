import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // Initialize Supabase Client internally to prevent Build Type-Check crashes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tzlzxxaskazzvtzetvbk.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_WpnUu0-1kHxN3jD-BFs8jw_gXfPzvd_";
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    const filename = `${uniqueSuffix}-${safeName}`;
    
    // Upload to Supabase Storage "uploads" bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json({ error: "Cloud uzatish xatosi: " + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);
    
    return NextResponse.json({ fileUrl: publicUrl });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
