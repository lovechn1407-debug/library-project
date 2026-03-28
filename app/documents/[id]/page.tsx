import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

const prisma = new PrismaClient()

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const doc = await prisma.document.findUnique({
        where: { id: parseInt(id) },
    })
    if (!doc) {
        return { title: 'Document Not Found | ITS Library' }
    }
    return {
        title: `${doc.file_name} | ITS College Library`,
        description: `Download or view ${doc.file_name} — ${doc.course}, Semester ${doc.semester}, Academic Year ${doc.year}. Subject: ${doc.subject_tag || doc.folder_name}. Available at ITS Engineering College Library.`,
    }
}

export default async function DocumentDetailPage({ params }: Props) {
    const { id } = await params
    const doc = await prisma.document.findUnique({
        where: { id: parseInt(id) },
    })

    if (!doc) {
        notFound()
    }

    const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at top, #eff6ff 0%, transparent 40%)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1rem',
        }}>
            {/* Back Link */}
            <div style={{ width: '100%', maxWidth: '680px', marginBottom: '1.5rem' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#2563eb',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Library
                </Link>
            </div>

            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '680px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}>
                {/* Header Band */}
                <div style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    padding: '2rem 2rem 2.5rem',
                    position: 'relative',
                }}>
                    {/* File Icon */}
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="rgba(255,255,255,0.9)" />
                            <path d="M14 2V8H20" stroke="rgba(37,99,235,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Subject Tag */}
                    {doc.subject_tag && (
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 12px',
                            borderRadius: '999px',
                            marginBottom: '0.75rem',
                            letterSpacing: '0.04em',
                        }}>
                            {doc.subject_tag}
                        </span>
                    )}

                    {/* Document Title */}
                    <h1 style={{
                        color: '#ffffff',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                        margin: 0,
                    }}>
                        {doc.file_name}
                    </h1>
                </div>

                {/* Metadata Grid */}
                <div style={{
                    padding: '1.75rem 2rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                }}>
                    {[
                        { label: 'Course', value: doc.course },
                        { label: 'Semester', value: `Semester ${doc.semester}` },
                        { label: 'Academic Year', value: doc.year },
                        { label: 'Subject', value: doc.folder_name },
                        { label: 'Uploaded On', value: uploadDate },
                    ].map(item => (
                        <div key={item.label}>
                            <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                                {item.label}
                            </p>
                            <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                }}>
                    <a
                        href={`/api/documents/download?id=${doc.id}&action=view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            flex: '1 1 140px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        View Online
                    </a>
                    <a
                        href={`/api/documents/download?id=${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            flex: '1 1 140px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#ffffff',
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            border: '1.5px solid #bfdbfe',
                            transition: 'all 0.2s',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download PDF
                    </a>
                </div>
            </div>

            {/* Footer note */}
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2rem', textAlign: 'center' }}>
                ITS Engineering College Library &mdash; Unified Question Paper Repository
            </p>
        </div>
    )
}
