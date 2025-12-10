import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Setup keyframes for background blobs and UI animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

/* UI Transitions */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 10px rgba(6, 182, 212, 0.2); } 50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5); } }

.animate-in { animation-duration: 0.6s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
.fade-in { animation-name: fadeIn; }
.slide-in-from-bottom { animation-name: slideUp; }
.animate-pulse-glow { animation: pulse-glow 3s infinite; }

.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.glass-panel-hover:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(148, 163, 184, 0.2);
}
`;
document.head.appendChild(styleSheet);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);