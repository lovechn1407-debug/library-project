import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        default: 'ITS Engineering College Library | Question Papers',
        template: '%s | ITS Engineering College Library'
    },
    description: 'Access the official digital library of ITS Engineering College, Greater Noida. Download B.Tech, B.Pharm, BBA, BCA, and MCA previous year question papers, syllabus, and study materials.',
    keywords: [
        'ITS Engineering College Library',
        'ITS Engineering Library',
        'ITS College Library',
        'ITS Engineering College',
        'ITS Engineering College Question Papers',
        'ITS Engineering College Previous Year Papers',
        'AKTU Previous Year Papers',
        'B.Tech Question Papers',
        'ITS Greater Noida Library',
        'Question Paper Library'
    ],
    authors: [{ name: 'ITS Engineering College' }],
    openGraph: {
        title: 'ITS Engineering College Library | Question Papers',
        description: 'Official digital library for ITS Engineering College students. Access B.Tech, B.Pharm, BBA, BCA previous year question papers.',
        url: 'https://itscollege-library.vercel.app',
        siteName: 'ITS Engineering College Library',
        images: [
            {
                url: '/logo.png', // Fallback to logo if specific sharing image isn't available
                width: 800,
                height: 600,
                alt: 'ITS Engineering College Logo',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // You will need to replace this with your actual Google Search Console verification ID
        google: 'your-google-verification-code', 
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}
