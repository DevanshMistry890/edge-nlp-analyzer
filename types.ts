import { PipelineType } from '@xenova/transformers';
export interface AIResult {
  data: any; // Flexible to accommodate different pipeline outputs
  inferenceTime: number; // in milliseconds
  modelLoadingTime?: number; // in milliseconds (only on first load)
}

export type TaskType = 'sentiment' | 'summarization' | 'ner';

export interface TaskConfig {
  id: TaskType;
  label: string;
  description: string;
  modelId: string;
  pipelineTask: PipelineType; // The transformers.js pipeline task name
  icon: string; // Lucide icon name
  quantized: boolean;
  themeColor: string; // For UI accents (e.g., 'cyan', 'purple', 'emerald')
  gradient: string; // CSS gradient string
  estimatedSize: string; // e.g. "65MB"
}

// Worker Communication Types
export type WorkerMessageRequest = {
  type: 'init' | 'run';
  taskId: TaskType;
  text: string;
  modelId?: string;
  pipelineTask?: PipelineType;
  quantized?: boolean;
};

export type WorkerMessageResponse = {
  type: 'result' | 'progress' | 'error' | 'init_complete';
  data?: any;
  progress?: {
    status: string;
    progress: number;
    file: string;
  };
  metrics?: {
    inferenceTime: number;
    loadTime?: number;
  };
  error?: string;
};

export interface NEREntity {
  entity_group: string; // 'PER', 'ORG', 'LOC', 'MISC'
  score: number;
  word: string;
  start: number; // Guaranteed by aggregation_strategy='simple'
  end: number;
}

export interface SentimentOutput {
  label: string;
  score: number;
}

export interface SummarizationOutput {
  summary_text: string;
}