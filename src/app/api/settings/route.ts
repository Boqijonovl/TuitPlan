import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "GLOBAL" }
    });
    
    // First time setup
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: "GLOBAL", maintenanceMode: false, broadcastActive: false, academicYear: "2026-2027", lockStructure: false }
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Sozlamalarni o'qishda xato" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { maintenanceMode, broadcastMessage, broadcastActive, academicYear, lockStructure } = await req.json();

    const updated = await prisma.systemSetting.upsert({
      where: { id: "GLOBAL" },
      update: { maintenanceMode, broadcastMessage, broadcastActive, academicYear, lockStructure },
      create: {
        id: "GLOBAL",
        maintenanceMode: maintenanceMode || false,
        broadcastMessage: broadcastMessage || null,
        broadcastActive: broadcastActive || false,
        academicYear: academicYear || "2026-2027",
        lockStructure: lockStructure || false
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Sozlamalarni saqlashda xato" }, { status: 500 });
  }
}
