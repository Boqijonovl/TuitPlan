import { NextResponse } from "next/server";
import { verifyBlockchainIntegrity } from "@/lib/blockchain";

export async function GET(req: Request) {
  try {
    const result = await verifyBlockchainIntegrity();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Blockchain verify error:", error);
    return NextResponse.json({ status: "ERROR", message: "Zanjirni tekshirishda xatolik yuz berdi" }, { status: 500 });
  }
}
