import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext()

export function useNotification() {
  return useContext(NotificationContext)
}

// --- INDIVIDUAL TOAST COMPONENT ---
function Toast({ id, message, type = 'error', duration = 5000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  // --- THEME CONFIGURATION ---
  const themes = {
    hint: {
      bgColor: 'rgba(20, 18, 5, 0.95)',      // Dark Yellow/Brown background
      borderColor: 'rgba(255, 215, 0, 0.3)', // Gold border
      iconBg: 'rgba(255, 215, 0, 0.15)',     // Gold icon background
      color: '#FFD700',                      // Gold text/icon
      title: 'Hang an Ornament',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <g transform="translate(12, 12) scale(0.6) translate(-12, -12)">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </g>
        </svg>
      )
    },
    success: {
      bgColor: 'rgba(5, 20, 5, 0.95)',       // Dark Green background
      borderColor: 'rgba(50, 255, 100, 0.3)',// Green border
      iconBg: 'rgba(50, 255, 100, 0.15)',    // Green icon background
      color: '#50ff64',                      // Green text/icon
      title: 'Success',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          {/* Checkmark centered */}
          <polyline points="8 12 11 15 16 9" />
        </svg>
      )
    },
    error: {
      bgColor: 'rgba(20, 5, 5, 0.95)',       // Dark Red background
      borderColor: 'rgba(255, 50, 50, 0.2)', // Red border
      iconBg: 'rgba(255, 80, 80, 0.15)',     // Red icon background
      color: '#ff5050',                      // Red text/icon
      title: 'Something went wrong',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    }
  }

  // Select theme based on type, fallback to error
  const theme = themes[type] || themes.error;

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300) 
  }

  return (
    <div 
      className="toast-card" 
      style={{
        background: theme.bgColor, 
        border: `1px solid ${theme.borderColor}`,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(0.9)' : 'scale(1)', 
      }}
    >
      {/* ICON CONTAINER */}
      <div style={{
        minWidth: '42px', height: '42px', 
        borderRadius: '12px', 
        background: theme.iconBg, 
        color: theme.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {theme.icon}
      </div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div className="toast-title">
          {theme.title}
        </div>
        <div className="toast-message">
          {message}
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <button onClick={handleClose} className="toast-close">✕</button>

      {/* PROGRESS BAR */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '3px',
        background: theme.color, width: '100%',
        animation: `progress ${duration}ms linear forwards`
      }} />
    </div>
  )
}

// --- PROVIDER COMPONENT ---
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'error', uniqueId = null) => {
    setNotifications(prev => {
      const cleanList = uniqueId ? prev.filter(n => n.uniqueId !== uniqueId) : prev;
      
      // Hints stay longer (10s), Errors/Success fade faster (5s)
      const duration = type === 'hint' ? 10000 : 5000; 
      
      const newToast = { id: Date.now(), uniqueId, message, type, duration }
      return [...cleanList, newToast]
    })
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      <style>{`
        /* --- RESPONSIVE CSS --- */
        
        .notification-container {
          position: fixed;
          z-index: 9999;
          display: flex;
          pointer-events: none;
          flex-direction: column;
          align-items: flex-end;
          bottom: 20px;
          right: 20px;
        }

        /* MOBILE DEFAULTS */
        .toast-card {
          position: relative;
          width: 85vw; 
          max-width: 550px; 
          border-radius: 16px; 
          padding: 16px;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 15px;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          pointer-events: auto;
        }

        .toast-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 2px;
          letter-spacing: -0.01em;
        }

        .toast-message {
          font-size: 12px;
          color: #ccc;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .toast-close:hover {
          opacity: 1;
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* --- DESKTOP OVERRIDES --- */
        @media (min-width: 420px) {
          .toast-card {
            width: 420px; 
            padding: 17px;
          }
        }

        /* --- MOBILE CONTAINER OVERRIDES --- */
        @media (max-width: 600px) {
          .notification-container {
            bottom: auto;   
            top: 20px;      
            left: 0; right: 0;       
            align-items: center; 
            flex-direction: column-reverse; 
          }
        }
      `}</style>

      <div className="notification-container">
        {notifications.map(n => (
          <Toast key={n.id} {...n} onClose={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}