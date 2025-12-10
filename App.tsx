import React from 'react';
import Analyzer from './components/Analyzer';
import './MeshGradient.css';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-200 animate-mesh-gradient">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('noise.svg')] opacity-[0.15]"></div>

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
