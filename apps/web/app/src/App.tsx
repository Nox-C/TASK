'use client';

import { useEffect, useState } from 'react';
import Main from './main';

export function App() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🧪 App useEffect running');
    setMounted(true);
    
    // Force DOM manipulation to verify client-side execution
    const testDiv = document.createElement('div');
    testDiv.id = 'client-test';
    testDiv.style.cssText = 'position:fixed;top:50px;right:10px;background:#2196F3;color:white;padding:8px;font-family:monospace;font-size:12px;z-index:9999;';
    testDiv.textContent = '🔵 JS Working';
    document.body.appendChild(testDiv);
    
    return () => {
      if (document.getElementById('client-test')) {
        document.body.removeChild(testDiv);
      }
    };
  }, []);
  
  console.log('🧪 App component rendering, mounted:', mounted);
  
  return (
    <>
      {/* Server-side rendered indicator */}
      <div id="server-indicator" style={{ 
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
