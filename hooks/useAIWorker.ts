/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import { useEffect, useRef, useState, useCallback } from 'react';
import { WorkerMessageRequest, WorkerMessageResponse, TaskType } from '../types';
import { getTaskConfig } from '../core/taskRegistry';
import AIWorker from '../workers/ai.worker.ts?worker';

export const useAIWorker = () => {
  const workerRef = useRef<Worker | null>(null);

  const [aiState, setAiState] = useState({
    status: 'idle',
    progress: null,
    result: null,
    error: null,
    metrics: null,
  });

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new AIWorker();

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
                  status: progress.status,
                },
              }));
            }
            break;

          case 'result':
            setAiState((prev) => ({
              ...prev,
              status: 'ready',
              result: data,
              metrics: metrics ?? null,
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
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const runTask = useCallback((taskId: TaskType, text: string) => {
    const config = getTaskConfig(taskId);
    if (!config || !workerRef.current) return;

    setAiState((prev) => ({
      ...prev,
      status: 'loading',
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
      metrics: null,
    });
  }, []);

  return { ...aiState, runTask, reset };
};