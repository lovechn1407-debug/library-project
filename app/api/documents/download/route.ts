import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const action = searchParams.get('action') || 'download'; // 'download' or 'view'

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

        // Instead of redirecting (which uses Telegram's forced download headers), fetch the file directly
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to fetch file from Telegram: ${fileResponse.statusText}`);
        }

        const fileBlob = await fileResponse.blob();

        // Define safe headers so browser views it inline instead of auto-downloading if requested
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf'); // Force PDF type
        if (action === 'view') {
            headers.set('Content-Disposition', 'inline; filename="' + encodeURIComponent(document.file_name) + '.pdf"');
        } else {
            headers.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(document.file_name) + '.pdf"');
        }

        return new NextResponse(fileBlob as any, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download/View error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
