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

    const courses = Array.from(new Set(subjects.map((s: { course: string }) => s.course)))
    courses.forEach((course) => {
      routes.push({
        url: `${baseUrl}?course=${encodeURIComponent(course)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    const uniqueSubjects = Array.from(new Set(subjects.map((s: { name: string }) => s.name)))
    uniqueSubjects.forEach((subject) => {
      routes.push({
        url: `${baseUrl}?subject=${encodeURIComponent(subject)}`,
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
      routes.push({
        url: `${baseUrl}/api/documents/download?id=${doc.id}`,
        lastModified: doc.uploadedAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return routes
}
