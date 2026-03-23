import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Prevent indexing admin panel and raw API routes
        },
        sitemap: 'https://itscollege-library.vercel.app/sitemap.xml',
    }
}
