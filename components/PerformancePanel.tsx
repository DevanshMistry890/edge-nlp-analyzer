/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Zap, Download, Database, Cpu } from 'lucide-react';

interface PerformancePanelProps {
  metrics: { inferenceTime: number; loadTime?: number } | null;
  modelId: string;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({ metrics, modelId }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
      {metrics.loadTime !== undefined && (
        <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Download size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">Load Time</span>
          </div>
          <p className="text-xl font-bold text-slate-200 font-mono">{(metrics.loadTime / 1000).toFixed(2)}<span className="text-sm text-slate-500">s</span></p>
        </div>
      )}

      <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Zap size={14} />
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">Inference</span>
        </div>
        <p className="text-xl font-bold text-slate-200 font-mono">{metrics.inferenceTime.toFixed(2)}<span className="text-sm text-slate-500">ms</span></p>
      </div>

      <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Cpu size={14} />
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">Device</span>
        </div>
        <p className="text-sm font-medium text-slate-300">WASM / CPU</p>
      </div>

      <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Database size={14} />
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">Architecture</span>
        </div>
        <p className="text-sm font-medium text-slate-300 truncate" title={modelId}>
          ONNX / 8-bit
        </p>
      </div>

    </div>
  );
};

export default PerformancePanel;