import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext()

export function useNotification() {
  return useContext(NotificationContext)
}

// --- INDIVIDUAL TOAST COMPONENT ---
function Toast({ id, message, type = 'error', duration = 5000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  const isHint = type === 'hint'
  
  // Colors
  const bgColor = isHint ? 'rgba(5, 20, 5, 0.95)' : 'rgba(20, 5, 5, 0.95)'
  const borderColor = isHint ? 'rgba(50, 255, 100, 0.3)' : 'rgba(255, 50, 50, 0.2)'
  const iconBg = isHint ? 'rgba(50, 255, 100, 0.2)' : 'rgba(255, 80, 80, 0.2)'
  const iconColor = isHint ? '#50ff64' : '#ff5050'
  const progressColor = isHint ? '#50ff64' : '#ff5050'
  
  const iconContent = isHint ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ) : '!'

  const titleText = isHint ? 'Hang an Ornament' : 'Could Not Hang Ornament'

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
        background: bgColor, 
        border: `1px solid ${borderColor}`,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(0.9)' : 'scale(1)', 
      }}
    >
      {/* ICON */}
      <div style={{
        minWidth: '42px', height: '42px', borderRadius: '50%',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '20px', flexShrink: 0
      }}>
        {iconContent}
      </div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div className="toast-title">
          {titleText}
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
        background: progressColor, width: '100%',
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
          width: 85vw; /* Responsive on Mobile */
          max-width: 550px; 
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 15px;
          color: #fff;
          font-family: Arial, sans-serif;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          pointer-events: auto;
        }

        .toast-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .toast-message {
          font-size: 14px;
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
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* --- DESKTOP OVERRIDES --- */
        @media (min-width: 550px) {
          .toast-card {
            width: 550px; 
            padding: 28px;
          }
          
          .toast-title {
            font-size: 18px; 
          }

          .toast-message {
            font-size: 16px;
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