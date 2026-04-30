'use client';

import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export default function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    // Override window.alert
    const originalAlert = window.alert;
    window.alert = (message: any) => {
      const id = Date.now();
      const stringMessage = String(message);
      
      setAlerts((prev) => [...prev, { id, message: stringMessage }]);
      
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setAlerts((prev) => prev.filter(a => a.id !== id));
      }, 6000);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const closeAlert = (id: number) => {
    setAlerts((prev) => prev.filter(a => a.id !== id));
  };

  return (
    <>
      {children}
      {/* Alert Container */}
      <div 
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '12px',
          pointerEvents: 'none' // Prevent empty container from capturing clicks
        }}
      >
        {alerts.map((alertItem) => (
          <div 
            key={alertItem.id}
            style={{
              pointerEvents: 'auto', // Re-enable clicks on the alert itself
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0,0,0,0.05)',
              borderRadius: '16px',
              padding: '16px 20px',
              minWidth: '320px',
              maxWidth: '420px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              animation: 'slideInAlert 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transformOrigin: 'bottom right'
            }}
          >
            <div style={{
              background: 'var(--gradient-blue, linear-gradient(135deg, #3b82f6 0%, #2563eb 100%))',
              color: 'white',
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <Info size={22} />
            </div>
            
            <div style={{ flex: 1, paddingTop: '1px' }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '15px', 
                color: '#1e293b',
                marginBottom: '4px',
                letterSpacing: '-0.2px'
              }}>
                การแจ้งเตือน
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#475569',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {alertItem.message}
              </div>
            </div>
            
            <button 
              onClick={() => closeAlert(alertItem.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                marginTop: '-2px',
                marginRight: '-6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInAlert {
          0% { opacity: 0; transform: translateX(60px) translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) translateY(0) scale(1); }
        }
      `}} />
    </>
  );
}
