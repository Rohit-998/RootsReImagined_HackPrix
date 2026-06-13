'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-switch to signup if mode=signup is in the URL
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name, role: 'consumer' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user info
      localStorage.setItem('mg_token', data.token);
      localStorage.setItem('mg_user', JSON.stringify(data.user));

      // Redirect to scan page
      router.push('/scan');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleAuthClick = () => {
    setShowGoogleModal(true);
  };

  const handleGoogleAccountSelect = () => {
    setShowGoogleModal(false);
    setIsLoading(true);
    
    setTimeout(() => {
      const mockUser = {
        id: 'google_demo_user',
        email: 'judge@hackathon.com',
        name: 'Demo Judge',
        role: 'consumer'
      };
      const mockToken = 'mock_jwt_token_for_google_oauth';

      localStorage.setItem('mg_token', mockToken);
      localStorage.setItem('mg_user', JSON.stringify(mockUser));
      
      router.push('/scan');
    }, 600); // Simulate network delay for realism
  };

  return (
    <>
    {showGoogleModal && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}>
        <div style={{
          background: 'white', borderRadius: '8px', width: '100%', maxWidth: '400px', 
          padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          <svg viewBox="0 0 24 24" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0 0 8px', color: '#202124' }}>Sign in with Google</h2>
          <p style={{ fontSize: '1rem', color: '#5f6368', marginBottom: '32px' }}>Choose an account to continue to MediGuard</p>
          
          <div 
            onClick={handleGoogleAccountSelect}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
              border: '1px solid #dadce0', borderRadius: '24px', cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#1967d2',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 600
            }}>D</div>
            <div>
              <div style={{ fontWeight: 600, color: '#3c4043', fontSize: '0.95rem' }}>Demo Judge</div>
              <div style={{ color: '#5f6368', fontSize: '0.85rem' }}>judge@hackathon.com</div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button 
              onClick={() => setShowGoogleModal(false)}
              style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600, cursor: 'pointer', padding: '8px 16px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    <Card className={styles.authCard}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
            <Shield size={32} />
          </div>
        </div>
        <h1 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
        <p className={styles.subtitle}>
          {isLogin 
            ? 'Enter your details to access your MediGuard dashboard.' 
            : 'Join MediGuard to start verifying your medicines.'}
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isLogin && (
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required={!isLogin}
            />
          </div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      <div className={styles.divider}>or</div>

      <button type="button" className={styles.googleBtn} onClick={handleGoogleAuthClick}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className={styles.toggleText}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button 
          type="button" 
          className={styles.toggleLink}
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
        </div>
      }>
        <AuthContent />
      </Suspense>
    </div>
  );
}
