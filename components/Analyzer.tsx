/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import React, { useState } from 'react';
import { TASK_REGISTRY } from '../core/taskRegistry';
import { useAIWorker } from '../hooks/useAIWorker';
import ResultPanel from './ResultPanel';
import PerformancePanel from './PerformancePanel';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import { TaskType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_TEXTS = {
    sentiment: "The new framework architecture significantly improves render performance. However, the documentation is somewhat sparse and the learning curve is steep for beginners.",
    ner: "Elon Musk announced that SpaceX plans to launch the Starship rocket from Boca Chica, Texas next month. NASA has already secured a contract for the Artemis mission.",
    summarization: "Quantum computing is a type of computation whose operations can exploit the collective properties of quantum states, such as superposition, interference, and entanglement. Devices that perform quantum computations are known as quantum computers. Though current quantum computers are too small to outperform usual (classical) computers for practical applications, they are believed to be capable of solving certain computational problems, such as integer factorization (which underlies RSA encryption), substantially faster than classical computers."
};

const Analyzer: React.FC = () => {
    const [activeTask, setActiveTask] = useState<TaskType>('sentiment');
    const [inputText, setInputText] = useState(PRESET_TEXTS['sentiment']);
    const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' } | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const { status, progress, result, error, metrics, runTask, reset } = useAIWorker();

    const handleTaskChange = (taskId: TaskType) => {
        reset(); // Clear previous results to prevent type mismatch crashes
        setActiveTask(taskId);
        if (inputText === PRESET_TEXTS[activeTask] || !inputText) {
            setInputText(PRESET_TEXTS[taskId]);
        }
    };

    const handleRun = () => {
        if (!inputText.trim()) return;
        runTask(activeTask, inputText);
    };

    // --- Smart Model Detection Logic ---
    const handleSmartDetect = () => {
        if (!inputText.trim()) {
            showNotification("Please enter some text to analyze first.", 'info');
            return;
        }

        setIsDetecting(true);

        setTimeout(() => {
            const len = inputText.length;
            const words = inputText.split(/\s+/).filter(w => w.length > 0);
            const wordCount = words.length;

            // Heuristics Scoring
            let scores = {
                summarization: 0,
                ner: 0,
                sentiment: 0
            };

            // 1. Summarization Score
            // High confidence if text is long (> 300 chars or > 50 words)
            if (len > 300 || wordCount > 50) scores.summarization += 10;
            if (len > 800) scores.summarization += 20; // Very strong signal

            // 2. NER Score
            // Count capitalized words that aren't at the start of sentences
            // (Rough heuristic: look for Capitalized words preceded by space, not period)
            const potentialEntities = inputText.match(/(?<!\. )\b[A-Z][a-z]+\b/g) || [];
            const entityDensity = potentialEntities.length / (wordCount || 1);

            if (entityDensity > 0.07) scores.ner += 10; // > 7% density
            if (potentialEntities.length > 3) scores.ner += 5; // At least 3 entities

            // 3. Sentiment Score (Default for short texts)
            const sentimentKeywords = ['good', 'bad', 'great', 'terrible', 'love', 'hate', 'amazing', 'awful', 'best', 'worst', 'excellent', 'poor'];
            const keywordMatch = words.filter(w => sentimentKeywords.includes(w.toLowerCase())).length;

            if (len < 300) scores.sentiment += 5;
            if (keywordMatch > 0) scores.sentiment += 5 + (keywordMatch * 2);

            // Decision Logic
            let suggestedTask: TaskType = 'sentiment';
            let reason = "";

            if (scores.summarization >= scores.ner && scores.summarization > scores.sentiment) {
                suggestedTask = 'summarization';
                reason = `Long text detected (${wordCount} words). Switching to Summarization model.`;
            } else if (scores.ner > scores.summarization && scores.ner > scores.sentiment) {
                suggestedTask = 'ner';
                reason = `High density of potential entities detected. Switching to Entity Recognition.`;
            } else {
                suggestedTask = 'sentiment';
                reason = `Short, opinionated text detected. Keeping Sentiment Analysis.`;
            }

            // Apply Selection
            if (suggestedTask !== activeTask) {
                reset(); // Clear results if we auto-switch
                setActiveTask(suggestedTask);
                showNotification(reason, 'success');
            } else {
                showNotification(`Current model is already optimal for this context. (${reason})`, 'info');
            }
            setIsDetecting(false);
        }, 500); // Fake delay for UX "thinking" feel
    };

    const showNotification = (msg: string, type: 'info' | 'success') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 6000);
    };

    const activeTaskConfig = TASK_REGISTRY.find(t => t.id === activeTask);

    // Derive display state
    const isDownloading = status === 'loading' && progress !== null;
    const isProcessing = status === 'loading' && progress === null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">

            {/* Hero Section */}
            <div className="text-center mb-16 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono mb-4"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    CLIENT-SIDE INFERENCE ENGINE
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                    Edge AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Analyzer</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    Experience the power of Transformer models running natively in your browser.
                    No latency, no server costs, absolute privacy.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Input & Controls */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Task Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TASK_REGISTRY.map((task) => {
                            const Icon = (Icons as any)[task.icon];
                            const isActive = activeTask === task.id;
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => handleTaskChange(task.id as TaskType)}
                                    className={clsx(
                                        // Use 'glass-panel group' on the button to define the outer layer
                                        "relative p-1 rounded-xl text-left transition-all duration-300 border overflow-hidden group glass-panel", // <-- Changed p-4 to p-1 to account for the inner padding
                                        isActive
                                            ? `border-${task.themeColor}-500/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                                            : "glass-panel-hover border-transparent hover:border-slate-700"
                                    )}
                                >
                                    {/* === START GLOW EFFECT LAYER === */}
                                    {isActive && (
                                        // This is the inner glow layer, using the task's gradient and blur-xl
                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${task.gradient} opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
                                    )}
                                    {/* === END GLOW EFFECT LAYER === */}

                                    {/* This is the inner content panel that sits ON TOP of the glow */}
                                    <div className={clsx(
                                        "relative z-10 p-3 rounded-lg", // <-- Added p-3 here for padding
                                        isActive
                                            ? `bg-slate-950/60` // Darker background when active
                                            : `bg-slate-900/80 group-hover:bg-slate-900/90` // Background when inactive
                                    )}>
                                        {/* Inner Gradient Background (For subtle shading, if desired) */}
                                        {isActive && (
                                            <div className={`absolute inset-0 bg-gradient-to-br ${task.gradient} opacity-5`}></div>
                                        )}

                                        <div className="relative z-20">
                                            <div className={clsx(
                                                "mb-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                isActive ? `bg-${task.themeColor}-500 text-white shadow-lg` : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                                            )}>
                                                {Icon && <Icon size={16} />}
                                            </div>
                                            <h3 className={clsx("font-semibold text-sm", isActive ? "text-white" : "text-slate-300")}>
                                                {task.label}
                                            </h3>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Editor Area */}
                    <div className="glass-panel rounded-2xl p-1 relative group">
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${activeTaskConfig?.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>

                        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                            {/* Header Toolbar */}
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSmartDetect}
                                        disabled={isDetecting}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all text-[10px] font-mono text-cyan-400 group/smart"
                                        title="Auto-select best model based on input context"
                                    >
                                        <Icons.Sparkles size={12} className={clsx("group-hover/smart:animate-spin-slow", isDetecting && "animate-spin")} />
                                        {isDetecting ? 'ANALYZING...' : 'SMART DETECT'}
                                    </button>
                                    <span className="text-[10px] uppercase font-mono text-slate-500">input.txt</span>
                                </div>
                            </div>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-64 p-5 text-base md:text-lg text-slate-300 placeholder-slate-600 bg-transparent resize-none outline-none font-light leading-relaxed"
                                placeholder="Enter text to analyze..."
                                spellCheck={false}
                            />

                            {/* Notification Overlay */}
                            <AnimatePresence>
                                {notification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, x: '-50%' }}
                                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                                        exit={{ opacity: 0, y: 10, x: '-50%' }}
                                        className="absolute bottom-24 left-1/2 w-[90%] md:w-auto md:min-w-[400px] z-20 pointer-events-none"
                                    >
                                        <div className={clsx(
                                            "px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3",
                                            notification.type === 'success'
                                                ? "bg-slate-900/90 border-cyan-500/30 text-cyan-100"
                                                : "bg-slate-900/90 border-slate-700 text-slate-300"
                                        )}>
                                            <div className="mt-1">
                                                {notification.type === 'success' ? <Icons.Sparkles size={16} className="text-cyan-400" /> : <Icons.Info size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-xs font-bold font-mono uppercase mb-1 opacity-70">
                                                    {notification.type === 'success' ? 'AI Optimization' : 'System Info'}
                                                </h5>
                                                <p className="text-xs leading-relaxed opacity-90">{notification.message}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Bar */}
                            <div className="px-5 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center h-20">
                                {isDownloading ? (
                                    <div className="flex-1 mr-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                                                <Icons.DownloadCloud size={14} className="animate-bounce" />
                                                {progress?.file ? (
                                                    <span className="truncate max-w-[150px] md:max-w-xs">{`DOWNLOADING: ${progress.file}`}</span>
                                                ) : (
                                                    'INITIALIZING ENGINE...'
                                                )}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                                EST. SIZE: {activeTaskConfig?.estimatedSize}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress?.percentage || 0}%` }}
                                                transition={{ duration: 0.2 }}
                                            ></motion.div>

                                            {/* Indeterminate shimmer overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[9px] text-slate-600 font-mono">
                                                {progress?.status === 'initiate' ? 'Connecting to Hugging Face CDN...' : 'Fetching weights...'}
                                            </span>
                                            <span className="text-[9px] text-cyan-500/70 font-mono">
                                                {progress?.percentage ? `${Math.round(progress.percentage)}%` : '0%'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 mr-6 flex items-center gap-4">
                                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                            <Icons.Database size={12} className="text-slate-600" />
                                            <span>MODEL: <span className="text-slate-300">{activeTaskConfig?.modelId.split('/')[1]}</span></span>
                                        </div>
                                        <div className="hidden md:flex text-xs text-slate-500 font-mono items-center gap-2">
                                            <Icons.HardDrive size={12} className="text-slate-600" />
                                            <span>SIZE: <span className="text-slate-300">{activeTaskConfig?.estimatedSize}</span></span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleRun}
                                    disabled={status === 'loading' || !inputText.trim()}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                                        isProcessing || isDownloading
                                            ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                                            : `bg-gradient-to-r ${activeTaskConfig?.gradient} text-white hover:shadow-${activeTaskConfig?.themeColor}-500/25 hover:brightness-110`
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Icons.Loader size={16} className="animate-spin" />
                                            <span>PROCESSING</span>
                                        </>
                                    ) : isDownloading ? (
                                        <>
                                            <Icons.Loader2 size={16} className="animate-spin" />
                                            <span>LOADING</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Play size={16} fill="currentColor" />
                                            <span>RUN ANALYSIS</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results & Telemetry */}
                <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[400px] glass-panel rounded-2xl border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 relative overflow-hidden"
                            >
                                {/* Scanning Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-[scan_2s_ease-in-out_infinite]"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 relative">
                                        <span className="absolute inset-0 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></span>
                                        <Icons.BrainCircuit size={32} className="text-cyan-400 animate-pulse" />
                                    </div>
                                    <h4 className="text-slate-200 font-bold text-lg mb-1 tracking-tight">Neural Processing</h4>
                                    <p className="text-sm text-slate-500 font-mono">INFERENCE ENGINE RUNNING...</p>
                                </div>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6"
                            >
                                {/* Result Card */}
                                <div className="relative">
                                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${activeTaskConfig?.gradient} rounded-2xl opacity-20 blur`}></div>
                                    <ResultPanel taskId={activeTask} data={result} inputText={inputText} config={activeTaskConfig} />
                                </div>

                                {/* Telemetry Card */}
                                <PerformancePanel metrics={metrics} modelId={activeTaskConfig?.modelId || ''} />

                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] glass-panel rounded-2xl border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 p-8 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group hover:border-cyan-500/30 transition-colors duration-500">
                                    <Icons.Cpu size={32} className="opacity-20 group-hover:opacity-50 transition-opacity" />
                                </div>
                                <h4 className="text-slate-400 font-medium mb-2">Ready to Process</h4>
                                <p className="text-sm opacity-50 max-w-xs">
                                    Select a task and click run to initialize the WebAssembly inference engine.
                                </p>
                                {!isDownloading && (
                                    <div className="mt-8 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-500 max-w-[250px]">
                                        <p className="font-mono mb-1 text-slate-400">NOTE:</p>
                                        First run requires downloading model weights ({activeTaskConfig?.estimatedSize}). Subsequent runs are instant.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="p-4 bg-red-950/30 text-red-400 rounded-xl border border-red-900/50 flex items-center gap-3 backdrop-blur-md">
                            <Icons.AlertTriangle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default Analyzer;