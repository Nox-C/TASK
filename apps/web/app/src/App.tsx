'use client';

import { useEffect, useState } from 'react';
import Main from './main';

export function App() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🧪 App useEffect running');
    setMounted(true);
  }, []);
  
  console.log('🧪 App component rendering, mounted:', mounted);
  
  return (
    <>
      {/* Persistent test indicator */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: mounted ? '#4CAF50' : '#ff9800', 
        color: 'white', 
        padding: '12px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        {mounted ? '🟢 Client Mounted' : '🟠 Server Rendering'}
      </div>
      <Main />
    </>
  );
}
