import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const course = formData.get('course') as string;
        const semester = parseInt(formData.get('semester') as string);
        const year = formData.get('year') as string;

        const files = formData.getAll('files') as File[];
        const fileNames = formData.getAll('file_names') as string[];
        const subjectTags = formData.getAll('subject_tags') as string[];

        if (!files.length || !course || !semester || !year) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return NextResponse.json({ error: 'Telegram credentials missing in .env' }, { status: 500 });
        }

        const uploadedDocuments = [];

        // Loop through each file and upload independently
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const customName = (fileNames[i] && fileNames[i].trim() !== '') ? fileNames[i] : file.name;
            const subjectTag = subjectTags[i] || ''; // Retrieve specific subject tag

            // Prepare multipart form data for Telegram
            const telegramFormData = new FormData();
            telegramFormData.append('chat_id', TELEGRAM_CHAT_ID);
            telegramFormData.append('document', file);

            // Upload to Telegram
            const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: telegramFormData,
            });

            const telegramData = await telegramRes.json();

            if (!telegramData.ok) {
                console.error('Telegram API Error for file:', file.name, telegramData);
                continue; // Skip failed uploads but continue with others
            }

            const file_id = telegramData.result.document.file_id;

            // Save to database, adding subject_tag
            const document = await prisma.document.create({
                data: {
                    course,
                    semester,
                    year,
                    folder_name: '', // Deprecated, kept empty
                    file_name: customName,
                    telegram_file_id: file_id,
                    subject_tag: subjectTag,
                },
            });

            uploadedDocuments.push(document);
        }

        if (uploadedDocuments.length === 0) {
            return NextResponse.json({ error: 'All Telegram uploads failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: uploadedDocuments.length, documents: uploadedDocuments });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
