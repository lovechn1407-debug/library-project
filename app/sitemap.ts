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

    const courses: string[] = Array.from(new Set(subjects.map((s: any) => String(s.course))))
    courses.forEach((course) => {
      // Strip out special characters that strict XML parsers or routers hate
      const safeCourse = course.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
      routes.push({
        url: `${baseUrl}/?course=${encodeURIComponent(safeCourse)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    const uniqueSubjects: string[] = Array.from(new Set(subjects.map((s: any) => String(s.name))))
    uniqueSubjects.forEach((subject) => {
      const safeSubject = subject.replace(/&/g, 'and').replace(/[^a-zA-Z0-9.\- ]/g, '')
      routes.push({
        url: `${baseUrl}/?subject=${encodeURIComponent(safeSubject)}`,
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
      // Intentionally omitting '&action=view' to prevent ANY xml ampersand parsing errors
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
