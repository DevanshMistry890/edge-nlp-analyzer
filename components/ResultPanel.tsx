/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useState } from 'react';
import { TaskType, SentimentOutput, SummarizationOutput, NEREntity, TaskConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal, ScanFace, FileText, Zap } from 'lucide-react';

interface ResultPanelProps {
  taskId: TaskType;
  data: any;
  inputText: string;
  config?: TaskConfig;
}

// Simple list of sentiment-loaded words for highlighting "triggers"
// In a real ABSA system, this would come from attention heads.
const SENTIMENT_DICTIONARY: Record<string, string[]> = {
    positive: ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'wonderful', 'beautiful', 'happy', 'joy', 'improves', 'significantly', 'perfect', 'awesome', 'nice', 'clean', 'efficient', 'fast', 'secure', 'better', 'rich', 'easy', 'smart', 'secured', 'success'],
    negative: ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'sad', 'poor', 'sparse', 'steep', 'difficult', 'slow', 'broken', 'error', 'fail', 'failure', 'ugly', 'messy', 'hard', 'complex', 'boring', 'weak', 'insecure', 'vulnerable', 'problem', 'issue']
};

// Typewriter Effect Component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(intervalId);
    }, 10); // Faster typing speed
    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="text-slate-300 leading-relaxed font-light text-lg whitespace-pre-wrap">{displayedText}<span className="animate-pulse text-violet-500">|</span></p>;
};

const ResultPanel: React.FC<ResultPanelProps> = ({ taskId, data, inputText, config }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  // --- Visualization: Sentiment ---
  if (taskId === 'sentiment') {
    const sentimentData = data as SentimentOutput[];
    const normalized = Array.isArray(sentimentData) ? sentimentData : [sentimentData];
    
    // Sort to ensure consistent order
    normalized.sort((a, b) => b.score - a.score);
    const dominant = normalized[0];
    const isPositive = dominant.label === 'POSITIVE';

    const chartData = normalized.map(item => ({
      name: item.label,
      score: Math.round(item.score * 100),
      fill: item.label === 'POSITIVE' ? '#10b981' : '#f43f5e' 
    }));

    // Keyword Highlighter Logic
    const renderTriggerWords = () => {
        const words = inputText.split(/(\s+)/); // Split keep delimiters
        return words.map((word, i) => {
            const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
            let className = "text-slate-300 transition-colors duration-500";
            
            if (SENTIMENT_DICTIONARY.positive.includes(lower)) {
                className = "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
            } else if (SENTIMENT_DICTIONARY.negative.includes(lower)) {
                className = "text-rose-400 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]";
            }

            return <span key={i} className={className}>{word}</span>;
        });
    };

    return (
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ScanFace size={120} />
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                Sentiment Confidence
            </h3>
        </div>
        
        <div className="h-48 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={40} animationDuration={1500}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
            {/* Overall Result */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between"
            >
                <span className="text-sm text-slate-400 min-w-0">Analysis Result</span>
                <div className="text-right flex-shrink-0">
                    <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'} drop-shadow-md`}>
                        {chartData[0].name}
                    </span>
                    <div className="text-sm text-slate-500 font-mono">CONFIDENCE: {chartData[0].score}%</div>
                </div>
            </motion.div>
            
            {/* Aspect Trigger Panel */}
            <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="p-4 bg-slate-950/50 rounded-xl border border-slate-800"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className={isPositive ? 'text-emerald-400' : 'text-rose-400'} />
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Key Triggers Detected</span>
                </div>
                <div className="text-sm leading-relaxed max-h-[125px] overflow-y-auto custom-scrollbar">
                    {renderTriggerWords()}
                </div>
            </motion.div>
        </div>
      </div>
    );
  }

  // --- Visualization: Summarization ---
  if (taskId === 'summarization') {
    const summaryData = data as SummarizationOutput[];
    const text = summaryData[0]?.summary_text || "No summary generated.";

    return (
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col h-full">
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                Abstractive Summary
            </h3>
            <button 
                onClick={() => handleCopy(text)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Copy to clipboard"
            >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
        </div>

        <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800/50 relative overflow-hidden flex-grow shadow-inner">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-transparent opacity-50"></div>
            <TypewriterText text={text} />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <FileText size={12} />
                <span>REDUCTION: {Math.max(0, Math.round((1 - text.length / inputText.length) * 100))}%</span>
            </div>
            <div className="text-xs font-mono text-slate-600">
                {text.length} CHARS
            </div>
        </div>
      </div>
    );
  }

  // --- Visualization: NER ---
  if (taskId === 'ner') {
    const nerData = data as NEREntity[];
    
    const renderHighlightedText = () => {
        if (!Array.isArray(nerData) || nerData.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Terminal size={32} className="mb-2 opacity-50" />
                    <p>No named entities detected.</p>
                </div>
            );
        }

        // 1. Sort entities
        const sortedEntities = [...nerData].sort((a, b) => (a.start || 0) - (b.start || 0));
        
        const fragments = [];
        let currentTextIndex = 0;

        sortedEntities.forEach((entity, idx) => {
            // Robust offset calculation
            let start = entity.start;
            let end = entity.end;
            // Guard against undefined words (which causes the crash)
            const word = entity.word ? entity.word.trim() : ''; 

            // FALLBACK: If API returned bad indices (common in WebAssembly bindings), find the word manually
            // This is crucial for stability
            if (typeof start !== 'number' || typeof end !== 'number' || start === end) {
                 if (!word) return; // Cannot highlight without a word
                 const foundIndex = inputText.indexOf(word, currentTextIndex);
                 if (foundIndex !== -1) {
                     start = foundIndex;
                     end = foundIndex + word.length;
                 } else {
                     // Can't find it? Try finding it anywhere to at least show it, or skip
                     const looseIndex = inputText.indexOf(word);
                     if (looseIndex !== -1 && looseIndex >= currentTextIndex) {
                        start = looseIndex;
                        end = looseIndex + word.length;
                     } else {
                         return; 
                     }
                 }
            }

            // Ensure we don't go backwards
            if (start < currentTextIndex) return;

            // 1. Render Plain Text Before Entity
            if (start > currentTextIndex) {
                fragments.push(
                    <span key={`text-${idx}`} className="text-slate-300 font-light leading-loose">
                        {inputText.slice(currentTextIndex, start)}
                    </span>
                );
            }

            // 2. Determine Style based on Group
            const group = (entity.entity_group || 'MISC').toUpperCase();
            let colorClasses = "bg-amber-900/30 text-amber-200 border-amber-500/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]"; // Default MISC
            let labelColor = "text-amber-400";
            let labelText = "MISC";

            if (group.includes('PER')) { 
                colorClasses = "bg-blue-900/30 text-blue-200 border-blue-500/30 shadow-[0_0_10px_-2px_rgba(59,130,246,0.2)]"; 
                labelColor = "text-blue-400";
                labelText = "PERSON";
            } else if (group.includes('ORG')) { 
                colorClasses = "bg-purple-900/30 text-purple-200 border-purple-500/30 shadow-[0_0_10px_-2px_rgba(168,85,247,0.2)]"; 
                labelColor = "text-purple-400";
                labelText = "ORG";
            } else if (group.includes('LOC')) { 
                colorClasses = "bg-emerald-900/30 text-emerald-200 border-emerald-500/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]"; 
                labelColor = "text-emerald-400";
                labelText = "LOCATION";
            }

            // 3. Render Entity Chip
            fragments.push(
                <span key={`entity-${idx}`} className="relative inline-block group mx-1 align-middle">
                    <motion.span 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`
                            inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-medium border cursor-help transition-all duration-200 hover:brightness-110
                            ${colorClasses}
                        `}
                    >
                        {/* Use entity.word explicitly to avoid empty chips if slicing fails */}
                        <span>{inputText.slice(start, end) || word}</span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider opacity-80 ${labelColor}`}>{labelText}</span>
                    </motion.span>
                    
                    {/* Hover Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                        <span className="block bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap">
                            <span className="text-slate-500 mr-2">CONFIDENCE</span>
                            <span className="font-mono font-bold text-white">{(entity.score * 100).toFixed(1)}%</span>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></span>
                        </span>
                    </span>
                </span>
            );

            currentTextIndex = end;
        });

        // 4. Render Remaining Text
        if (currentTextIndex < inputText.length) {
            fragments.push(
                <span key="text-end" className="text-slate-300 font-light leading-loose">
                    {inputText.slice(currentTextIndex)}
                </span>
            );
        }

        return <div className="text-lg">{fragments}</div>;
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                Extracted Entities
            </h3>
            
            <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
                {renderHighlightedText()}
            </div>
            
            <div className="mt-6 flex gap-4 text-xs flex-wrap justify-center bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 backdrop-blur-sm">
                <LegendItem color="bg-blue-500" label="PERSON" />
                <LegendItem color="bg-purple-500" label="ORG" />
                <LegendItem color="bg-emerald-500" label="LOCATION" />
                <LegendItem color="bg-amber-500" label="MISC" />
            </div>
        </div>
    );
  }

  return null;
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2 text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-800">
        <span className={`w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor] opacity-80`}></span> 
        <span className="font-mono font-medium tracking-wide">{label}</span>
    </div>
);

export default ResultPanel;