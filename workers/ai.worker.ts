/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import { pipeline, env, PipelineType } from '@xenova/transformers';
import { WorkerMessageRequest, WorkerMessageResponse } from '../types';

// Skip local check to enforce CDN usage
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton cache
const pipelines: Record<string, any> = {};

const sendMessage = (msg: WorkerMessageResponse) => {
  self.postMessage(msg);
};

const progressCallback = (data: any) => {
  // Only send main model file progress to avoid noise
  if (data.status === 'progress' && (data.file.includes('onnx') || data.file.includes('model'))) {
    sendMessage({
        type: 'progress',
        progress: {
            status: data.status,
            progress: data.progress,
            file: data.file,
        },
    });
  }
};

self.addEventListener('message', async (event: MessageEvent<WorkerMessageRequest>) => {
  const { type, taskId, text, modelId, pipelineTask, quantized } = event.data;

  try {
    if (type === 'run') {
        if (!modelId || !pipelineTask) {
            throw new Error('Invalid Configuration: modelId and pipelineTask are required.');
        }

        const pipelineKey = `${pipelineTask}-${modelId}`;
        let loadTime = 0;

        // 1. Initialize Pipeline (Singleton)
        if (!pipelines[pipelineKey]) {
            const startLoad = performance.now();
            
            console.log(`[Worker] Loading model: ${modelId}`);
            pipelines[pipelineKey] = await pipeline(pipelineTask, modelId, {
                quantized: quantized ?? true,
                progress_callback: progressCallback,
            });

            loadTime = performance.now() - startLoad;
            console.log(`[Worker] Model loaded in ${loadTime}ms`);
            
            sendMessage({ type: 'init_complete' });
        }

        // 2. Run Inference
        console.log(`[Worker] Running inference for task: ${taskId}`);
        const startInference = performance.now();
        let output;

        // Task-specific parameters for better results
        switch (taskId) {
            case 'ner':
                // FIX: Removed ignore_labels which conflicts with aggregation_strategy in some versions
                // aggregation_strategy: 'simple' automatically handles B-tag/I-tag merging and O-tag ignoring
                output = await pipelines[pipelineKey](text, { 
                    aggregation_strategy: 'simple' 
                });
                break;
            
            case 'summarization':
                output = await pipelines[pipelineKey](text, {
                    max_new_tokens: 150, // Cap length for speed
                    min_new_tokens: 10,
                    num_beams: 2,        // Reduce beams for faster inference (default is usually 4)
                    length_penalty: 2.0, // Encourage concise summaries
                    do_sample: false,
                });
                break;
            
            case 'sentiment':
                output = await pipelines[pipelineKey](text, {
                    top_k: 2
                });
                break;

            default:
                output = await pipelines[pipelineKey](text);
        }

        const inferenceTime = performance.now() - startInference;
        console.log(`[Worker] Inference complete:`, output);

        // Sanitize output for Transferable safety
        const safeOutput = JSON.parse(JSON.stringify(output));

        sendMessage({
            type: 'result',
            data: safeOutput,
            metrics: {
                inferenceTime,
                loadTime: loadTime > 0 ? loadTime : undefined
            }
        });
    }
  } catch (err: any) {
    console.error('[Worker Error]', err);
    sendMessage({
      type: 'error',
      error: err.message || 'An error occurred during inference.',
    });
  }
});