import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');

        const where = course ? { course } : {};
        const subjects = await prisma.subject.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(subjects);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, course } = body;

        if (!name || !course) {
            return NextResponse.json({ error: 'Name and course are required' }, { status: 400 });
        }

        const subject = await prisma.subject.create({
            data: { name, course },
        });

        return NextResponse.json(subject);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.subject.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }
}
