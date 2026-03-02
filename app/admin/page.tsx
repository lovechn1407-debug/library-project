'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

interface FileUpload {
    file: File;
    customName: string;
    subjectTag: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

    const [documents, setDocuments] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    // Upload Form State
    const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
    const [course, setCourse] = useState('B.Tech');
    const [semester, setSemester] = useState('1');
    const [year, setYear] = useState('2024-25');

    // Settings State
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCourse, setNewSubjectCourse] = useState('B.Tech');

    const fetchDocuments = async () => {
        const res = await fetch('/api/documents');
        if (res.ok) setDocuments(await res.json());
    };

    const fetchSubjects = async () => {
        const res = await fetch('/api/subjects');
        if (res.ok) setSubjects(await res.json());
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDocuments();
        }
        fetchSubjects(); // Always fetch subjects to populate dropdowns
    }, [activeTab]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    // ------------------ DASHBOARD LOGIC ------------------

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                customName: file.name,
                subjectTag: ''
            }));
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const updateFileData = (index: number, key: keyof FileUpload, value: string) => {
        setSelectedFiles(prev => {
            const newArr = [...prev];
            newArr[index] = { ...newArr[index], [key]: value };
            return newArr;
        });
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return alert('Please select files.');

        setIsUploading(true);
        const formData = new FormData();
        formData.append('course', course);
        formData.append('semester', semester);
        formData.append('year', year);

        selectedFiles.forEach(f => {
            formData.append('files', f.file);
            formData.append('file_names', f.customName);
            formData.append('subject_tags', f.subjectTag);
        });

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                alert('Files uploaded successfully via Telegram Bot!');
                setSelectedFiles([]);
                fetchDocuments();
            } else {
                const error = await res.json();
                alert('Upload failed: ' + (error.error || 'Unknown Error'));
            }
        } catch (e) {
            alert('Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDoc = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchDocuments();
    };

    // ------------------ SETTINGS LOGIC ------------------

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        const res = await fetch('/api/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSubjectName, course: newSubjectCourse })
        });

        if (res.ok) {
            setNewSubjectName('');
            fetchSubjects();
        } else {
            alert('Failed to add subject');
        }
    };

    const handleDeleteSubject = async (id: number) => {
        if (!confirm("Delete this subject?")) return;
        const res = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchSubjects();
    };


    // Helper definitions
    const availableCourses = ['B.Tech', 'B.Pharm', 'BBA', 'BCA', 'MCA'];
    const subjectsForSelectedCourse = subjects.filter(s => s.course === course);

    return (
        <div className={`animate-fade-in ${styles.dashboard}`}>
            <header className={`glass ${styles.header}`}>
                <div>
                    <h2 className="gradient-text">ITS Library Admin</h2>
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            Upload & Manage
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings (Subjects)
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => router.push('/')} className="btn-premium btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>View Library</button>
                    <button onClick={handleLogout} className="btn-premium" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </header>

            {activeTab === 'dashboard' && (
                <div className={styles.grid}>
                    {/* Upload Panel */}
                    <div className={`glass ${styles.panel}`}>
                        <h3>Upload Files</h3>
                        <form className={styles.form} onSubmit={handleUpload}>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Course</label>
                                    <select className="input-premium" value={course} onChange={e => { setCourse(e.target.value); setSelectedFiles(prev => prev.map(f => ({ ...f, subjectTag: '' }))) }}>
                                        {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className={styles.group}>
                                    <label>Semester</label>
                                    <select className="input-premium" value={semester} onChange={e => setSemester(e.target.value)}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Academic Year</label>
                                    <select className="input-premium" value={year} onChange={e => setYear(e.target.value)}>
                                        {['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18'].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.group}>
                                <label>Select PDF Files</label>
                                <div className={styles.fileBox}>
                                    <input type="file" multiple accept=".pdf" onChange={handleFileChange} id="fileInput" style={{ display: 'none' }} />
                                    <label htmlFor="fileInput" className="btn-premium btn-secondary" style={{ width: 'max-content', margin: '0 auto', display: 'block' }}>+ Choose Files</label>
                                </div>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className={styles.fileListWrapper}>
                                    <h4>Selected Files ({selectedFiles.length})</h4>
                                    <div className={styles.fileList}>
                                        {selectedFiles.map((f, i) => (
                                            <div key={i} className={styles.fileListItem}>
                                                <div className={styles.fileListInfo}>
                                                    <span className={styles.originalName}>{f.file.name}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input
                                                            type="text"
                                                            className="input-premium"
                                                            style={{ padding: '6px 10px', fontSize: '0.85rem', flex: 1 }}
                                                            value={f.customName}
                                                            onChange={(e) => updateFileData(i, 'customName', e.target.value)}
                                                            placeholder="Display Name"
                                                        />
                                                        <select
                                                            className="input-premium"
                                                            style={{ padding: '6px 10px', fontSize: '0.85rem', flex: 1 }}
                                                            value={f.subjectTag}
                                                            onChange={(e) => updateFileData(i, 'subjectTag', e.target.value)}
                                                            required
                                                        >
                                                            <option value="" disabled>Select Subject Tag</option>
                                                            {subjectsForSelectedCourse.map(sub => (
                                                                <option key={sub.id} value={sub.name}>{sub.name}</option>
                                                            ))}
                                                            {subjectsForSelectedCourse.length === 0 && <option value="" disabled>No subjects found for {course}</option>}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeFile(i)} className={styles.removeBtn}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-premium" disabled={isUploading || selectedFiles.length === 0} style={{ width: '100%', marginTop: '16px' }}>
                                {isUploading ? 'Uploading to Telegram...' : `Upload ${selectedFiles.length} File(s)`}
                            </button>
                        </form>
                    </div>

                    {/* Existing Files Panel */}
                    <div className={`glass ${styles.panel}`} style={{ overflow: 'auto' }}>
                        <h3>Manage Uploaded Library</h3>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>File Name</th>
                                        <th>Subject Tag</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map(doc => (
                                        <tr key={doc.id}>
                                            <td>
                                                <span className={styles.badge}>{doc.course}</span>
                                                <span className={styles.badge}>Sem {doc.semester}</span>
                                                <span className={styles.badge}>{doc.year}</span>
                                            </td>
                                            <td>{doc.file_name}</td>
                                            <td><span className={styles.subjectBadge}>{doc.subject_tag || 'No Tag'}</span></td>
                                            <td>
                                                <button onClick={() => handleDeleteDoc(doc.id)} className={styles.deleteBtn}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {documents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No documents uploaded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className={styles.settingsGrid}>
                    <div className={`glass ${styles.panel}`}>
                        <h3>Add New Subject Tag</h3>
                        <form className={styles.form} onSubmit={handleAddSubject}>
                            <div className={styles.group}>
                                <label>Course</label>
                                <select className="input-premium" value={newSubjectCourse} onChange={e => setNewSubjectCourse(e.target.value)}>
                                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className={styles.group}>
                                <label>Subject Name</label>
                                <input type="text" className="input-premium" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="e.g. Data Structures" required />
                            </div>
                            <button type="submit" className="btn-premium">Add Subject</button>
                        </form>
                    </div>

                    <div className={`glass ${styles.panel}`} style={{ overflow: 'auto' }}>
                        <h3>Manage Subject Tags</h3>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Subject Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map(sub => (
                                        <tr key={sub.id}>
                                            <td><span className={styles.badge}>{sub.course}</span></td>
                                            <td style={{ fontWeight: 500 }}>{sub.name}</td>
                                            <td>
                                                <button onClick={() => handleDeleteSubject(sub.id)} className={styles.deleteBtn}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {subjects.length === 0 && (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No subjects declared yet. Add one!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
