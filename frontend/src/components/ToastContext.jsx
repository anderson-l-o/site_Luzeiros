import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'success', message, timeout = 4000 }) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, type, message }]);
    if (timeout > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            marginBottom: 8,
            minWidth: 260,
            padding: '10px 12px',
            borderRadius: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            color: t.type === 'error' ? '#721c24' : '#155724',
            background: t.type === 'error' ? '#f8d7da' : '#d4edda',
            border: t.type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ marginRight: 8 }}>{t.message}</div>
            <button onClick={() => removeToast(t.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.showToast;
}

export default ToastProvider;
