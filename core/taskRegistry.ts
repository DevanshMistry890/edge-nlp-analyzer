/*
* Copyright (c) 2025 Devansh Vinodkumar Mistry
* * This source code is licensed under the GNU General Public License v3.0 
* found in the LICENSE file in the root directory of this source tree.
*/
import { TaskConfig } from '../types';

export const TASK_REGISTRY: TaskConfig[] = [
  {
    id: 'sentiment',
    label: 'Sentiment Analysis',
    description: 'Real-time emotional tone detection. Classifies text as Positive or Negative using DistilBERT.',
    modelId: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    pipelineTask: 'sentiment-analysis',
    icon: 'Heart',
    quantized: true,
    themeColor: 'rose',
    gradient: 'from-pink-500 to-rose-500',
    estimatedSize: '67 MB',
  },
  {
    id: 'ner',
    label: 'Entity Recognition',
    description: 'Extracts entities like Persons, Organizations, and Locations using BERT-base NER.',
    modelId: 'Xenova/bert-base-NER',
    pipelineTask: 'token-classification',
    icon: 'ScanText',
    quantized: true,
    themeColor: 'cyan',
    gradient: 'from-cyan-400 to-blue-500',
    estimatedSize: '100 MB',
  },
  {
    id: 'summarization',
    label: 'Summarization',
    description: 'Distills long articles into concise summaries using DistilBART CNN.',
    modelId: 'Xenova/distilbart-cnn-6-6',
    pipelineTask: 'summarization',
    icon: 'FileText',
    quantized: true,
    themeColor: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    estimatedSize: '280 MB',
  },
];

export const getTaskConfig = (id: string): TaskConfig | undefined => {
  return TASK_REGISTRY.find((t) => t.id === id);
};