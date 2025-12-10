# Edge NLP Analyzer 🧠
### Serverless, Privacy-First AI Inference in the Browser

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Tech](https://img.shields.io/badge/Tech-React_%7C_TypeScript_%7C_WASM-61DAFB)
![Model](https://img.shields.io/badge/Model-DistilBERT_%28Quantized%29-yellow)
![Status](https://img.shields.io/badge/Status-Live_Demo-success)

> **[🔴 View Live Demo](https://DevanshMistry890.github.io/edge-nlp-analyzer)**

![Application Screenshot](/ss.png)
*Real-time sentiment analysis running locally via WebAssembly.*

---

## 📖 Overview

**Edge NLP Analyzer** is a high-performance text analysis dashboard that runs **state-of-the-art Transformer models directly in the user's browser**. 

Unlike traditional AI apps that send data to a Python backend (API), this application leverages **WebAssembly (WASM)** and **ONNX Runtime** to perform inference entirely on the client side. This ensures **zero latency** after the initial load and **100% data privacy**—your text never leaves your device.

### 🚀 Key Features
* **Multi-Task AI:** Switch between Sentiment Analysis, Named Entity Recognition (NER), and Text Summarization instantly.
* **Model Interpretability:** Visualizes *why* a prediction was made by highlighting key triggers (e.g., positive vs. negative words) in real-time.
* **Zero-Blocking UI:** Heavy tensor calculations are offloaded to **Web Workers**, ensuring the interface remains 60fps smooth even during inference.
* **Batch Processing:** Upload CSV datasets to analyze distinct trends across hundreds of rows (Sentiment Distribution, Entity Frequency).
* **Edge Optimization:** Uses 8-bit quantized models to reduce memory usage by 75% without sacrificing accuracy.

---

## 🛠️ Tech Stack & Architecture

This project bridges the gap between modern Frontend Engineering and AI Engineering.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | **React + Vite** | High-performance UI rendering. |
| **Language** | **TypeScript** | Strict typing for tensor data structures. |
| **AI Engine** | **Transformers.js** | Handling tokenizer and pipeline tasks. |
| **Inference** | **ONNX Runtime Web** | Running models via WebAssembly (WASM). |
| **Threading** | **Web Workers** | Offloading inference from the main thread. |
| **Models** | **Hugging Face Hub** | Source for quantized `.onnx` models. |

### System Architecture
1.  **Model Loading:** On first visit, the app downloads a quantized model (approx. 40MB-260MB) to the browser cache.
2.  **Input Processing:** User text is tokenized and sent to a dedicated **Web Worker**.
3.  **Inference:** The Worker runs the ONNX model via WASM (SIMD enabled).
4.  **Visualization:** Results are passed back to the Main Thread for rendering via **Recharts**.

---

## 📊 Performance Metrics

* **Average Inference Time:** ~100ms (on Standard CPU)
* **Model Size:** ~67MB (Quantized Int8) vs 260MB (Original FP32)
* **Device:** CPU-based WebAssembly

---

## 💻 Running Locally

To clone and run this application on your local machine:

```bash
# 1. Clone the repository
git clone [[https://github.com/](https://github.com/)DevanshMistry890/edge-nlp-analyzer.git](https://github.com/DevanshMistry890/edge-nlp-analyzer.git)

# 2. Navigate to directory
cd edge-nlp-analyzer

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
