import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');
        const semester = searchParams.get('semester');
        const year = searchParams.get('year');
        const search = searchParams.get('search');

        const where: any = {};
        if (course) where.course = course;
        if (semester) where.semester = parseInt(semester);
        if (year) where.year = year;
        if (search) {
            where.OR = [
                { file_name: { contains: search } }
            ];
        }

        const documents = await prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Admin API to delete a record
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID missing' }, { status: 400 });

        await prisma.document.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
