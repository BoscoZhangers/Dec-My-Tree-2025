import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext()

export function useNotification() {
  return useContext(NotificationContext)
}

// --- INDIVIDUAL TOAST COMPONENT ---
function Toast({ id, message, type = 'error', duration = 5000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  // Configuration based on type
  const isHint = type === 'hint'
  
  // Colors
  const bgColor = isHint ? 'rgba(5, 20, 5, 0.95)' : 'rgba(20, 5, 5, 0.95)'
  const borderColor = isHint ? 'rgba(50, 255, 100, 0.3)' : 'rgba(255, 50, 50, 0.2)'
  const iconBg = isHint ? 'rgba(50, 255, 100, 0.2)' : 'rgba(255, 80, 80, 0.2)'
  const iconColor = isHint ? '#50ff64' : '#ff5050'
  const progressColor = isHint ? '#50ff64' : '#ff5050'
  
  // Content
  const iconChar = isHint ? '?' : '!'
  const titleText = isHint ? 'Hang an Ornament' : 'Could Not Hang Ornament'

  // Auto-close timer
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300) 
  }

  return (
    <div style={{
      position: 'relative',
      width: '400px',
      maxWidth: '90vw', 
      background: bgColor, 
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      opacity: isExiting ? 0 : 1,
      // Animation logic handles both left/right directions depending on css alignment
      transform: isExiting ? 'scale(0.9)' : 'scale(1)', 
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden', 
      pointerEvents: 'auto'
    }}>
      {/* ICON */}
      <div style={{
        minWidth: '32px', height: '32px', borderRadius: '50%',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '18px', marginLeft: '8px'
      }}>
        {iconChar}
      </div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
          {titleText}
        </div>
        <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.4' }}>
          {message}
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <button 
        onClick={handleClose}
        style={{
          background: 'none', border: 'none', color: '#888', 
          cursor: 'pointer', fontSize: '18px', padding: '4px'
        }}
      >
        ✕
      </button>

      {/* TIME PROGRESS BAR */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, height: '3px',
        background: progressColor,
        width: '100%',
        animation: `progress ${duration}ms linear forwards`
      }} />

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// --- PROVIDER COMPONENT ---
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'error', uniqueId = null) => {
    setNotifications(prev => {
      const cleanList = uniqueId ? prev.filter(n => n.uniqueId !== uniqueId) : prev;
      
      const newToast = { 
        id: Date.now(), 
        uniqueId: uniqueId, 
        message, 
        type 
      }
      
      return [...cleanList, newToast]
    })
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      {/* CSS For Responsive Positioning */}
      <style>{`
        .notification-container {
          position: fixed;
          z-index: 9999;
          display: flex;
          pointer-events: none;
          
          /* --- DESKTOP DEFAULTS --- */
          bottom: 20px;
          right: 20px;
          flex-direction: column; /* Stacks upwards from bottom */
          align-items: flex-end;
        }

        /* --- MOBILE OVERRIDES --- */
        @media (max-width: 600px) {
          .notification-container {
            bottom: auto;   /* Unset bottom */
            top: 20px;      /* Move to Top */
            left: 0;        
            right: 0;       /* Full width helpers */
            
            align-items: center; /* Center horizontally */
            
            /* column-reverse makes the LAST item in the array (Newest) 
               appear at the TOP visually. The stack then grows DOWN.
            */
            flex-direction: column-reverse; 
          }
        }
      `}</style>

      <div className="notification-container">
        {notifications.map(n => (
          <Toast 
            key={n.id} 
            {...n} 
            onClose={removeNotification} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}