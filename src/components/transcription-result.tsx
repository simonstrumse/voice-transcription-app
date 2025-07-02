"use client";

import { useState } from "react";
import { Copy, Check, FileText, Wand2 } from "lucide-react";

interface TranscriptionData {
  id: string;
  originalText: string;
  processedText?: string;
  duration?: number;
  status: string;
}

interface TranscriptionResultProps {
  transcription: TranscriptionData;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "processed">("processed");

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (transcription.status !== "completed") {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {transcription.status === "processing" ? "Processing your audio..." : "Failed to process audio"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Transcription Result
            </h3>
            {transcription.duration && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Duration: {formatDuration(transcription.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab("processed")}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === "processed"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Enhanced
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === "original"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <FileText className="h-4 w-4 mr-1" />
              Original
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {activeTab === "processed" && transcription.processedText ? (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => copyToClipboard(transcription.processedText!, "processed")}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Copy enhanced text"
                >
                  {copied === "processed" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 pr-12">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {transcription.processedText}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enhanced with AI for improved readability and punctuation
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => copyToClipboard(transcription.originalText, "original")}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Copy original text"
                >
                  {copied === "original" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 pr-12">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {transcription.originalText}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Original transcription from Whisper AI
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}