import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: {
                orderId: 'asc'
            }
        });
        return NextResponse.json(announcements);
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, color, isBold, isItalic, isUnderline, orderId } = body;

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const newAnnouncement = await prisma.announcement.create({
            data: {
                text,
                color: color || "#ffffff",
                isBold: Boolean(isBold),
                isItalic: Boolean(isItalic),
                isUnderline: Boolean(isUnderline),
                orderId: orderId || 0
            }
        });

        return NextResponse.json(newAnnouncement);
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to add announcement" }, { status: 500 });
    }
}
