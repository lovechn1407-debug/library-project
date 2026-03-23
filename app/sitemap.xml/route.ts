import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Escape XML special characters to guarantee valid XML output
function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function generateSiteMap(urls: { loc: string, lastmod: string, changefreq: string, priority: string }[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => {
        return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    }).join('\n')}
</urlset>`
}

export async function GET() {
    const baseUrl = 'https://itscollege-library.vercel.app'
    const urls = []

    urls.push({
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
    })

    try {
        const subjects = await prisma.subject.findMany({
            select: { name: true, course: true },
        })

        const courses: string[] = Array.from(new Set(subjects.map((s: any) => String(s.course))))
        courses.forEach((course: string) => {
            const safeCourse = course.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
            urls.push({
                loc: `${baseUrl}/?course=${encodeURIComponent(safeCourse)}`,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.8'
            })
        })

        const uniqueSubjects: string[] = Array.from(new Set(subjects.map((s: any) => String(s.name))))
        uniqueSubjects.forEach((subject: string) => {
            const safeSubject = subject.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
            urls.push({
                loc: `${baseUrl}/?subject=${encodeURIComponent(safeSubject)}`,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.7'
            })
        })

        const documents = await prisma.document.findMany({
            select: { id: true, uploadedAt: true }
        })

        documents.forEach((doc) => {
            urls.push({
                loc: `${baseUrl}/api/documents/download?id=${doc.id}`,
                lastmod: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
                changefreq: 'monthly',
                priority: '0.6'
            })
        })
    } catch (error) {
        console.error("Sitemap generation error:", error)
    }

    const xml = generateSiteMap(urls)

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}
