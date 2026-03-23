import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://itscollege-library.vercel.app'
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    // 1. Fetch unique courses and subjects
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

    subjects.forEach((subject) => {
      routes.push({
        url: `${baseUrl}?course=${encodeURIComponent(subject.course)}&subject=${encodeURIComponent(subject.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
    
    // 2. Fetch all documents for direct PDF indexing
    const documents = await prisma.document.findMany({
      select: { id: true, uploadedAt: true }
    })
    
    documents.forEach((doc) => {
      routes.push({
        url: `${baseUrl}/api/documents/download?id=${doc.id}&action=view`,
        lastModified: doc.uploadedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return routes
}
