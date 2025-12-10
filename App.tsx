import React from 'react';
import Analyzer from './components/Analyzer';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-200">

      {/* Premium Dark Mesh Gradient Background with Blue Theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/50 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/50 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[50%] h-[50%] bg-indigo-900/50 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>

        {/* SVG Mesh Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('noise.svg')] opacity-[0.15]"></div>
      </div>

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Simple futuristic header strip */}
        <header className="w-full border-b border-white/5 bg-slate-950/25 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-bold tracking-tight text-white">EDGE <span className="text-slate-500 font-light">AI</span></span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/xenova/transformers.js" target="_blank" rel="noreferrer" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors">
                Powered by Transformers.js
              </a>
            </div>
          </div>
        </header>

        <div className="flex-grow">
          <Analyzer />
        </div>

        <footer className="relative z-10 py-8 text-center text-slate-600 text-md border-t border-white/5 mt-auto">
          <p className="font-mono">INITIALIZING NEURAL ENGINE... READY.</p>
          <p className="mt-2">© 2025 Devansh Mistry. Run entirely in browser.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;