'use client';

import Main from './main';

export function App() {
  console.log('🧪 App component rendering');
  
  return (
    <>
      {/* Simple test indicator - no hooks */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: '#4CAF50', 
        color: 'white', 
        padding: '12px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        🟢 App Working
      </div>
      <Main />
    </>
  );
}
