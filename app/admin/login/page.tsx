'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || 'Login failed');
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleLogin} className={`glass ${styles.form} animate-fade-in`}>
                <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '8px' }}>Admin Portal</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>ITS Engineering College</p>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        className="input-premium"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        className="input-premium"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={`btn-premium ${styles.submitBtn}`}>
                    Secure Login
                </button>
            </form>
        </div>
    );
}
