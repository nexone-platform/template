'use client';

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (workspaceId: string, email: string, password: string) => Promise<boolean>;
  appName?: string;
  error?: string | null;
  loading?: boolean;
}

export default function LoginPage({ onLogin, appName = 'NexOne', error: externalError, loading: externalLoading }: LoginPageProps) {
  const [workspaceId, setWorkspaceId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isWorkspaceFocused, setIsWorkspaceFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const loading = externalLoading ?? internalLoading;
  const error = externalError ?? internalError;

  const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailBorderColor = isEmailFocused
    ? '#6366f1'
    : (!isEmailValid ? '#ef4444' : (email !== '' ? '#6366f1' : 'rgba(148,163,184,0.15)'));

  const workspaceBorderColor = isWorkspaceFocused || workspaceId !== '' ? '#6366f1' : 'rgba(148,163,184,0.15)';
  const passwordBorderColor = isPasswordFocused || password !== '' ? '#6366f1' : 'rgba(148,163,184,0.15)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    if (!workspaceId || !email || !password) {
      setInternalError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setInternalLoading(true);
    try {
      const success = await onLogin(workspaceId, email, password);
      if (!success) {
        setInternalError('ตัวย่อบริษัท อีเมล หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setInternalError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      fontFamily: "'Inter', 'Noto Sans Thai', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'pulse 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'pulse 10s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '420px', padding: '0 24px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 700, color: '#f8fafc',
            margin: '0 0 8px', letterSpacing: '-0.5px',
          }}>
            {appName}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Enterprise Resource Planning
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148,163,184,0.1)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{
            fontSize: '20px', fontWeight: 600, color: '#f1f5f9',
            margin: '0 0 8px',
          }}>
            เข้าสู่ระบบ
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 28px' }}>
            ลงชื่อเข้าใช้ด้วยบัญชีองค์กรของคุณ
          </p>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              fontSize: '13px', color: '#fca5a5',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Workspace ID */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#94a3b8', marginBottom: '8px',
              }}>
                ตัวย่อบริษัท (Workspace ID)
              </label>
              <input
                type="text"
                value={workspaceId}
                onChange={(e) => {
                  // Allow only uppercase English letters and numbers
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setWorkspaceId(val);
                }}
                placeholder="Ex. NEXONE"
                autoComplete="organization"
                autoFocus
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(15,23,42,0.6)', border: `1px solid ${workspaceBorderColor}`,
                  borderRadius: '12px', color: '#f1f5f9', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                }}
                onFocus={() => setIsWorkspaceFocused(true)}
                onBlur={() => setIsWorkspaceFocused(false)}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#94a3b8', marginBottom: '8px',
              }}>
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(15,23,42,0.6)', border: `1px solid ${emailBorderColor}`,
                  borderRadius: '12px', color: '#f1f5f9', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 500,
                color: '#94a3b8', marginBottom: '8px',
              }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px',
                    background: 'rgba(15,23,42,0.6)', border: `1px solid ${passwordBorderColor}`,
                    borderRadius: '12px', color: '#f1f5f9', fontSize: '14px',
                    outline: 'none', transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748b',
                    cursor: 'pointer', padding: '4px', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontSize: '12px', color: '#475569',
          marginTop: '28px',
        }}>
          © {new Date().getFullYear()} {appName} • Powered by NexOne Platform
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #475569; }
        
        /* Override browser autofill styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
            -webkit-text-fill-color: #f1f5f9 !important;
            border-color: #6366f1 !important;
            caret-color: #f1f5f9 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
