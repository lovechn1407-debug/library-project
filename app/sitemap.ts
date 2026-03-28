import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering — prevents Vercel CDN caching a stale/broken sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    // /?course= and /?subject= URLs are intentionally excluded.
    // They are client-side JS filter states, NOT distinct server-rendered pages.
    // Including query-param-only URLs causes XML parsing errors in Google Search Console.

    // Real indexable pages: one HTML page per document
    const documents = await prisma.document.findMany({
      select: { id: true, uploadedAt: true }
    })

    documents.forEach((doc) => {
      routes.push({
        url: `${baseUrl}/documents/${doc.id}`,
        lastModified: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return routes
}

