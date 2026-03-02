import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ITS Engineering College - Question Paper Library',
    description: 'Digital Library for Previous Year Question Papers',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <main className="container">
                    {children}
                </main>
            </body>
        </html>
    )
}
