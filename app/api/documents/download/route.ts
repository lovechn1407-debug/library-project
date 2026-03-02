import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
        }

        const document = await prisma.document.findUnique({
            where: { id: parseInt(id) },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Call Telegram API to get the download URL
        const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${document.telegram_file_id}`);
        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            console.error('Telegram getFile Error:', telegramData);
            return NextResponse.json({ error: 'Failed to retrieve file location from Telegram' }, { status: 500 });
        }

        const file_path = telegramData.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file_path}`;

        // Redirect the browser directly to the Telegram download URL
        return NextResponse.redirect(downloadUrl);

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
