"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "../components/header";
import { AudioUpload } from "../components/audio-upload";
import { TranscriptionResult } from "../components/transcription-result";
import { History, Loader2 } from "lucide-react";

interface TranscriptionData {
  id: string;
  originalText: string;
  processedText?: string;
  duration?: number;
  status: string;
  filename: string;
  createdAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionData | null>(null);
  const [recentTranscriptions, setRecentTranscriptions] = useState<TranscriptionData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent transcriptions when user is signed in
  useEffect(() => {
    if (session?.user) {
      loadRecentTranscriptions();
    }
  }, [session]);

  const loadRecentTranscriptions = async () => {
    try {
      const response = await fetch("/api/transcriptions?limit=5");
      if (response.ok) {
        const data = await response.json();
        setRecentTranscriptions(data.transcriptions);
      }
    } catch (error) {
      console.error("Failed to load recent transcriptions:", error);
    }
  };

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setCurrentTranscription(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setCurrentTranscription({
        ...data,
        filename: file.name,
        createdAt: new Date().toISOString(),
      });

      // Reload recent transcriptions
      loadRecentTranscriptions();
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session ? (
          // Not signed in
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to Voice Transcription
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Upload audio files and get AI-powered transcriptions with enhanced formatting.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Please sign in with GitHub to get started.
            </p>
          </div>
        ) : (
          // Signed in
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Upload Audio for Transcription
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your audio file and get an AI-enhanced transcription
              </p>
            </div>

            {/* Upload Component */}
            <AudioUpload onUpload={handleUpload} isProcessing={isProcessing} />

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Current Transcription Result */}
            {currentTranscription && (
              <TranscriptionResult transcription={currentTranscription} />
            )}

            {/* Recent Transcriptions */}
            {recentTranscriptions.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                  <History className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Recent Transcriptions
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {recentTranscriptions.map((transcription) => (
                    <div
                      key={transcription.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setCurrentTranscription(transcription)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {transcription.filename}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transcription.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {transcription.processedText || transcription.originalText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
