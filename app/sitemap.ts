import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://itscollege-library.vercel.app'

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    const subjects = await prisma.subject.findMany({
      select: { name: true, course: true },
    })

    const courses: string[] = Array.from(new Set(subjects.map((s: { course: string }) => String(s.course))))
    courses.forEach((course) => {
      // Remove &, <, >, ?, =, etc. to ensure 100% valid XML and bypass any Next.js URI decoding bugs
      const safeCourse = course.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
      routes.push({
        url: `${baseUrl}?course=${encodeURIComponent(safeCourse)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    const uniqueSubjects: string[] = Array.from(new Set(subjects.map((s: { name: string }) => String(s.name))))
    uniqueSubjects.forEach((subject) => {
      const safeSubject = subject.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
      routes.push({
        url: `${baseUrl}?subject=${encodeURIComponent(safeSubject)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Fetch all documents for indexing
    const documents = await prisma.document.findMany({
      select: { id: true, uploadedAt: true }
    })

    documents.forEach((doc) => {
      // Intentionally omitting '&action=view' to prevent the XML parsing error in GSC
      // Also ensuring doc.uploadedAt is treated perfectly as a Date
      const dateStr = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
      routes.push({
        url: `${baseUrl}/api/documents/download?id=${doc.id}`,
        lastModified: dateStr,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return routes
}
