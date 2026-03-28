'use client';

import React, { useState } from 'react';

interface CredentialModalProps {
  platform: 'bluesky' | 'mastodon' | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (handle: string, token: string) => Promise<void>;
}

export default function CredentialModal({ platform, isOpen, onClose, onSubmit }: CredentialModalProps) {
  const [handle, setHandle] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !platform) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!handle || !token) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(handle, token);
      setHandle('');
      setToken('');
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add credential');
      setLoading(false);
    }
  };

  const platformLabel = platform === 'bluesky' ? 'Bluesky' : 'Mastodon';
  const handlePlaceholder = platform === 'bluesky' ? 'your.bsky.social' : '@user@mastodon.social';
  const tokenPlaceholder = platform === 'bluesky' ? 'Your app password' : 'Your access token';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Connect {platformLabel}</h2>
          <button style={styles.closeButton} onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="handle" style={styles.label}>
              {platform === 'bluesky' ? 'Bluesky Handle' : 'Mastodon Handle'}
            </label>
            <input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={handlePlaceholder}
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.help}>
              {platform === 'bluesky'
                ? 'Your Bluesky handle (e.g., your.bsky.social)'
                : 'Your Mastodon username (e.g., @user@mastodon.social)'}
            </p>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="token" style={styles.label}>
              {platform === 'bluesky' ? 'App Password' : 'Access Token'}
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={tokenPlaceholder}
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.help}>
              {platform === 'bluesky'
                ? 'Create an app password in Bluesky settings'
                : 'Create a personal access token in Mastodon settings'}
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelButton} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  } as React.CSSProperties,
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#e2e8f0',
    margin: 0,
  } as React.CSSProperties,
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0,
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
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
  help: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  } as React.CSSProperties,
  error: {
    padding: '12px',
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    borderRadius: '6px',
    fontSize: '14px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  } as React.CSSProperties,
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#334155',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  } as React.CSSProperties,
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
  } as React.CSSProperties,
};
