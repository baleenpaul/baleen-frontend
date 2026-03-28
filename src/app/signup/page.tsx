'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://baleen-backend.onrender.com/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('baleen_token', data.token);
      localStorage.setItem('baleen_user', JSON.stringify(data.user));

      // Redirect to feeds
      router.push('/feeds');
    } catch (err: any) {
      setError('Network error. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>🐋 Baleen</h1>
        <p style={styles.subtitle}>Social, without the noise</p>

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '20px',
  } as React.CSSProperties,
  formWrapper: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    borderRadius: '12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
  } as React.CSSProperties,
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#06b6d4',
    marginBottom: '8px',
  } as React.CSSProperties,
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '32px',
    fontSize: '14px',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#cbd5e1',
  } as React.CSSProperties,
  input: {
    padding: '12px',
    border: '1px solid #334155',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
  } as React.CSSProperties,
  button: {
    padding: '12px',
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
  } as React.CSSProperties,
  error: {
    padding: '12px',
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    borderRadius: '6px',
    fontSize: '14px',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '20px',
  } as React.CSSProperties,
  link: {
    color: '#06b6d4',
    textDecoration: 'none',
    fontWeight: '600',
  } as React.CSSProperties,
};
