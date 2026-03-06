import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { text, color, isBold, isItalic, isUnderline, orderId } = body;

        const updatedAnnouncement = await prisma.announcement.update({
            where: { id },
            data: {
                text,
                color,
                isBold,
                isItalic,
                isUnderline,
                orderId
            }
        });

        return NextResponse.json(updatedAnnouncement);
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await prisma.announcement.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
    }
}
