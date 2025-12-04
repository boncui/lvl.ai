'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { organizerAgentAPI } from '@/lib/api';

interface AIInsightsCardProps {
  onRefresh?: () => void;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ onRefresh }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAgentAPI.getProductivityAnalysis();
      setInsights(response.analysis);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Unable to fetch AI insights. Please try again later.');
      // Set a fallback insight
      setInsights(
        `Based on your recent activity, here are some observations:

• **Focus Areas**: Consider prioritizing high-impact tasks during your peak productivity hours.

• **Consistency**: Regular task completion builds momentum. Try to maintain your daily streak!

• **Category Balance**: Ensure you're not neglecting any important life areas.

• **XP Growth**: Keep completing tasks to level up and unlock achievements.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = async () => {
    await fetchInsights();
    onRefresh?.();
  };

  // Parse markdown-like formatting in insights
  const formatInsights = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li
            key={index}
            className="ml-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\s•\-\*]+/, '') }}
          />
        );
      }
      
      // Empty lines
      if (!line.trim()) {
        return <br key={index} />;
      }

      // Regular paragraphs
      return (
        <p
          key={index}
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <Card className="border-2 border-violet-100 bg-gradient-to-br from-white to-violet-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-violet-500"
                >
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
                {!loading && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              AI Productivity Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations powered by AI
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {loading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">{error}</p>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <ul className="list-disc space-y-2 marker:text-violet-500">
                {insights && formatInsights(insights)}
              </ul>
            </div>
          </div>
        )}

        {/* Quick action tips */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium mb-3">Quick Tips</p>
          <div className="flex flex-wrap gap-2">
            {['Focus on urgent tasks', 'Take short breaks', 'Review weekly goals'].map((tip) => (
              <span
                key={tip}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700"
              >
                {tip}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;

