import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const planId = resolvedParams.id;
    const { title, year, departmentId, status, tasks, userId } = await request.json();
    
    // 1. Asosiy reja ma'lumotlarini yangilaymiz
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { 
        title, 
        year: Number(year),
        departmentId: departmentId || null,
        status: status || "DRAFT"
      }
    });

    // 2. Vazifalar ustida ishlash
    if (tasks && Array.isArray(tasks)) {
      const existingTasks = await prisma.task.findMany({ where: { planId } });
      const existingIds = existingTasks.map(t => t.id);
      
      const payloadIds = tasks.filter((t: any) => t.id).map((t: any) => t.id);
      
      // Ro'yxatdan o'chirilgan vazifalarni bazadan ham olib tashlaymiz
      const toDelete = existingIds.filter(id => !payloadIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.task.deleteMany({ where: { id: { in: toDelete } } });
      }
      
      // Bor bo'lganlarini yangilaymiz, yo'qlarini qo'shamiz
      for (const t of tasks) {
        if (t.id) {
          await prisma.task.update({
            where: { id: t.id },
            data: { 
              title: t.title, 
              timeframe: t.timeframe, 
              assignedRole: t.assignedRole === "" ? null : t.assignedRole,
              status: t.status 
            }
          });
        } else {
          await prisma.task.create({
            data: { 
              title: t.title, 
              timeframe: t.timeframe, 
              assignedRole: t.assignedRole === "" ? null : t.assignedRole, 
              status: t.status || "BAJARILMAGAN", 
              planId 
            }
          });
        }
      }
    }

    const updatedPlan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { tasks: true, department: true }
    });

    if (userId) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Rejani tahrirladi",
          details: `Reja: ${title}`
        }
      });
    }

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Rejani tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    const resolvedParams = await params;
    const planId = resolvedParams.id;
    
    // Yozib qolishi uchun reja nomini olib qolamiz
    const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { title: true } });
    
    // Archiving tasks first preventing native application faults
    await prisma.task.updateMany({ where: { planId }, data: { isDeleted: true } });
    
    // Archive the Plan
    await prisma.plan.update({ where: { id: planId }, data: { isDeleted: true } });

    if (userId && plan) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Rejani o'chirdi",
          details: `Reja: ${plan.title}`
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Plan delete error:", error);
    return NextResponse.json({ error: "Rejani o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
