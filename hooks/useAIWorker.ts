/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import { useEffect, useRef, useState, useCallback } from 'react';
import { WorkerMessageRequest, WorkerMessageResponse, TaskType } from '../types';
import { getTaskConfig } from '../core/taskRegistry';

interface AIState {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  progress: { file: string; percentage: number; status: string } | null;
  result: any | null;
  error: string | null;
  metrics: { inferenceTime: number; loadTime?: number } | null;
}

export const useAIWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [aiState, setAiState] = useState<AIState>({
    status: 'idle',
    progress: null,
    result: null,
    error: null,
    metrics: null,
  });

  useEffect(() => {
    // Initialize Worker
    if (!workerRef.current) {
      let workerUrl: URL;
      try {
        // Attempt to construct URL relative to the current module.
        // This is the standard way for Vite/ESM to handle worker imports.
        workerUrl = new URL('../workers/ai.worker.ts', import.meta.url);
      } catch (e) {
        // Fallback for environments where import.meta.url is invalid (e.g. blob URLs).
        // Assumes the application is served with /workers/ at the root.
        workerUrl = new URL('/workers/ai.worker.ts', window.location.origin);
      }

      workerRef.current = new Worker(workerUrl, {
        type: 'module',
      });

      workerRef.current.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
        const { type, data, error, progress, metrics } = event.data;

        switch (type) {
          case 'progress':
            if (progress) {
                setAiState((prev) => ({
                    ...prev,
                    status: 'loading',
                    progress: {
                        file: progress.file,
                        percentage: progress.progress,
                        status: progress.status
                    }
                }));
            }
            break;
          
          case 'init_complete':
            // Model loaded, transitioning to processing immediately usually in this flow
            break;

          case 'result':
            setAiState((prev) => ({
              ...prev,
              status: 'ready',
              result: data,
              metrics: metrics || null,
              progress: null,
            }));
            break;

          case 'error':
            setAiState((prev) => ({
              ...prev,
              status: 'error',
              error: error || 'Unknown error',
              progress: null,
            }));
            break;
        }
      };
    }

    return () => {
      // Cleanup happens on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const runTask = useCallback((taskId: TaskType, text: string) => {
    const config = getTaskConfig(taskId);
    if (!config || !workerRef.current) return;

    // Reset previous result state but keep 'idle' logic clean
    setAiState((prev) => ({
      ...prev,
      status: 'loading', // Start with loading/initializing
      result: null,
      error: null,
      metrics: null,
    }));

    const message: WorkerMessageRequest = {
      type: 'run',
      taskId,
      text,
      modelId: config.modelId,
      pipelineTask: config.pipelineTask,
      quantized: config.quantized,
    };

    workerRef.current.postMessage(message);
  }, []);

  const reset = useCallback(() => {
    setAiState({
        status: 'idle',
        progress: null,
        result: null,
        error: null,
        metrics: null
    });
  }, []);

  return {
    ...aiState,
    runTask,
    reset,
  };
};