import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/'], // Only prevent indexing admin panel
        },
        sitemap: 'https://itscollege-library.vercel.app/sitemap.xml',
    }
}
