'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Light Theme File Icon SVG (Blue/Doc)
const FileIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="url(#paint0_linear_file)" />
        <path d="M14 2V8H20" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_file" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#93c5fd" />
                <stop offset="1" stopColor="#60a5fa" />
            </linearGradient>
        </defs>
    </svg>
);

const AnnouncementTicker = ({ announcements }: { announcements: any[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!announcements || announcements.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % announcements.length);
        }, 8000); // Change banner every 8 seconds
        return () => clearInterval(interval);
    }, [announcements]);

    if (!announcements || announcements.length === 0) return null;

    return (
        <div className={styles.marqueeSection}>
            <div className={styles.marqueeTrack} style={{ transform: `translateY(-${currentIndex * 48}px)` }}>
                {announcements.map((ann, idx) => (
                    <div key={ann.id || idx} className={styles.marqueeSlide}>
                        <div
                            className={styles.marqueeTextInner}
                            style={{
                                color: ann.color || '#000000',
                                fontWeight: ann.isBold ? 'bold' : 'normal',
                                fontStyle: ann.isItalic ? 'italic' : 'normal',
                                textDecoration: ann.isUnderline ? 'underline' : 'none',
                                fontSize: '1.05rem'
                            }}
                        >
                            {ann.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Library() {
    const router = useRouter();

    // Data State
    const [documents, setDocuments] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [search, setSearch] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');
    const [filterSem, setFilterSem] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [filterSubject, setFilterSubject] = useState('All');

    // Sort State
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'a-z'

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/documents').then(res => res.json()).catch(() => []),
            fetch('/api/subjects').then(res => res.json()).catch(() => []),
            fetch('/api/announcements').then(res => res.json()).catch(() => [])
        ]).then(([docs, subs, anns]) => {
            setDocuments(Array.isArray(docs) ? docs : []);
            setSubjects(Array.isArray(subs) ? subs : []);
            setAnnouncements(Array.isArray(anns) ? anns : []);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    // Compute available filters dynamically from raw DB options or Subject API
    const availableCourses = ['All', 'B.Tech', 'B.Pharm', 'BBA', 'BCA', 'MCA'];
    const availableSems = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
    const availableYears = ['All', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18'];

    // Filter Subjects based on selected Course
    const availableSubjects = useMemo(() => {
        let subs = subjects;
        if (filterCourse !== 'All') {
            subs = subjects.filter(s => s.course === filterCourse);
        }
        return ['All', ...Array.from(new Set(subs.map(s => s.name)))];
    }, [subjects, filterCourse]);

    // When Course changes, reset Subject if it's no longer valid
    useEffect(() => {
        if (filterCourse !== 'All' && filterSubject !== 'All' && !availableSubjects.includes(filterSubject)) {
            setFilterSubject('All');
        }
    }, [filterCourse, availableSubjects, filterSubject]);

    // Apply Filters and Sorting
    const filteredAndSortedDocs = useMemo(() => {
        let filtered = documents.filter(doc => {
            // Global Search Text
            const searchMatch = search === '' ||
                doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
                doc.course.toLowerCase().includes(search.toLowerCase()) ||
                (doc.subject_tag && doc.subject_tag.toLowerCase().includes(search.toLowerCase()));

            if (!searchMatch) return false;

            // Sidebar Filters
            if (filterCourse !== 'All' && doc.course !== filterCourse) return false;
            if (filterSem !== 'All' && doc.semester.toString() !== filterSem) return false;
            if (filterYear !== 'All' && doc.year !== filterYear) return false;
            if (filterSubject !== 'All' && doc.subject_tag !== filterSubject) return false;

            return true;
        });

        // Sorting
        return filtered.sort((a, b) => {
            if (sortOption === 'newest') {
                return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
            } else if (sortOption === 'oldest') {
                return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
            } else if (sortOption === 'a-z') {
                return a.file_name.localeCompare(b.file_name);
            }
            return 0;
        });

    }, [documents, search, filterCourse, filterSem, filterYear, filterSubject, sortOption]);

    const clearFilters = () => {
        setSearch('');
        setFilterCourse('All');
        setFilterSem('All');
        setFilterYear('All');
        setFilterSubject('All');
    };

    return (
        <div className={`animate-fade-in ${styles.libraryPage}`}>
            <header className={`glass ${styles.hero}`}>
                <div className={styles.heroContent}>
                    <img src="/logo.png" alt="ITS Engineering College Logo" className={styles.logo} />
                    <p className={styles.subtitle}>Unified Question Paper Library</p>

                    <div className={styles.searchBar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.searchIcon}>
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 21L16.65 16.65" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search library for papers..."
                            className={`input-premium ${styles.searchInput}`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <button onClick={() => router.push('/admin/login')} className={styles.adminLink}>Admin Portal</button>
            </header>

            <AnnouncementTicker announcements={announcements} />

            <div className={styles.container}>
                <div className={styles.layout}>
                    {/* Sidebar Filters */}
                    <aside className={`glass ${styles.sidebar}`}>
                        <div className={styles.filterHeader}>
                            <h3>Filters</h3>
                            <button onClick={clearFilters} className={styles.clearBtn}>Clear All</button>
                        </div>

                        <div className={styles.filterControlsWrapper}>
                            <div className={styles.filterGroup}>
                                <label>Course</label>
                                <select className="input-premium" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Subject</label>
                                <select className="input-premium" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Semester</label>
                                <select className="input-premium" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                                    {availableSems.map(s => <option key={s} value={s}>{s === 'All' ? 'All' : `Semester ${s}`}</option>)}
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Academic Year</label>
                                <select className="input-premium" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className={styles.mainContent}>
                        <div className={styles.resultsHeader}>
                            <p className={styles.resultCount}>Showing <strong>{filteredAndSortedDocs.length}</strong> document(s)</p>
                            <div className={styles.sortControl}>
                                <label>Sort By:</label>
                                <select className="input-premium" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="a-z">Alphabetical (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.fileGrid}>
                            {loading ? (
                                <div className={styles.loaderContainer}>
                                    <div className={styles.spinner}></div>
                                    <p className={styles.loaderText}>Fetching Library Documents...</p>
                                </div>
                            ) : filteredAndSortedDocs.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--surface-border)" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <h3>No documents found</h3>
                                    <p>Try adjusting your search criteria or clearing filters.</p>
                                    <button onClick={clearFilters} className="btn-premium btn-secondary" style={{ marginTop: '16px' }}>Clear Filters</button>
                                </div>
                            ) : (
                                filteredAndSortedDocs.map(doc => {
                                    const isLongTag = doc.subject_tag && doc.subject_tag.length > 15;
                                    return (
                                        <div key={doc.id} className={`glass ${styles.fileCard}`}>
                                            <div className={styles.fileIcon}><FileIcon /></div>
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileTags}>
                                                    <div className={styles.subjectBadgeWrapper}>
                                                        <span
                                                            className={styles.subjectBadgeScroll}
                                                            style={!isLongTag ? { animation: 'none' } : {}}
                                                        >
                                                            {doc.subject_tag || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className={styles.fileName}>{doc.file_name}</h4>
                                                <p className={styles.fileMeta}>{doc.course} • Sem {doc.semester} • {doc.year}</p>
                                                <a href={`/api/documents/download?id=${doc.id}`} target="_blank" className={`btn-premium ${styles.downloadBtn}`}>Direct Download</a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <h4>Contact Us</h4>
                        <p><strong>Address:</strong> ITS Engineering College, 46, Knowledge Park-III, Greater Noida- 201308</p>
                        <p><strong>Phone:</strong> Toll-Free: 1800-1800-840</p>
                        <p><strong>Mobile:</strong> +91-8510010840, +91-8510010841, +91-8510010842</p>
                        <p><strong>Email:</strong> admission.ec@its.edu.in</p>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Anti-Ragging Helpline</h4>
                        <p><strong>Phone:</strong> 9582647615, 7838555875</p>
                    </div>
                </div>
                <div className={styles.copyright}>
                    <p>&copy; 2026 Designed and developed by AS Studios.</p>
                </div>
            </footer>

        </div>
    );
}
