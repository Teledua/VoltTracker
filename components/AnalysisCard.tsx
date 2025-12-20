import React from 'react';
import { AnalysisResult } from '../types';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  onAnalyze: () => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, onAnalyze }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-white/50">
        <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Usage Insights
        </h3>
        <button
          onClick={onAnalyze}
          disabled={analysis.isLoading}
          className="text-sm px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {analysis.isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {analysis.isLoading ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>
      
      <div className="p-6">
        {analysis.error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex gap-2 items-start text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{analysis.error}</p>
          </div>
        )}

        {!analysis.markdown && !analysis.isLoading && !analysis.error && (
          <div className="text-center py-8 text-gray-500">
            <p>Click "Refresh Analysis" to get insights on your electricity consumption patterns from Gemini AI.</p>
          </div>
        )}

        {analysis.markdown && (
          <div className="prose prose-sm prose-indigo max-w-none text-gray-700">
            <ReactMarkdown>{analysis.markdown}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};