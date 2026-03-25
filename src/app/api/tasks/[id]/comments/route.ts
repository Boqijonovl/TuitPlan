import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await context.params;
    const taskId = resolvedParams.id;
    
    // @ts-ignore
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });
    
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await context.params;
    const taskId = resolvedParams.id;
    const body = await request.json();
    
    if (!body.text || !body.userId) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }
    
    const newComment = await prisma.comment.create({
      data: {
        text: body.text,
        taskId,
        userId: body.userId
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    return NextResponse.json(newComment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
