import { useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { AIService, AIMessage, AIPortfolioAnalysis, PortfolioInsight } from '../services/aiService';
import { Portfolio, DeFiOpportunity, StakingPosition } from '../types/portfolio';

export interface UseAIReturn {
  // Data
  messages: AIMessage[];
  analysis: AIPortfolioAnalysis | null;
  isConfigured: boolean;
  
  // State
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  analyzePortfolio: () => Promise<void>;
  clearConversation: () => void;
  getRecommendations: (query: string) => Promise<{
    recommendations: string[];
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  
  // Portfolio data
  portfolio: Portfolio | null;
  defiOpportunities: DeFiOpportunity[];
  stakingPositions: StakingPosition[];
}

export const useAI = (
  portfolio: Portfolio | null,
  defiOpportunities: DeFiOpportunity[] = [],
  stakingPositions: StakingPosition[] = []
): UseAIReturn => {
  const { address, isConnected } = useAccount();
  
  // State
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [analysis, setAnalysis] = useState<AIPortfolioAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Services
  const aiService = useRef(new AIService()).current;
  const isSendingRef = useRef(false);
  const lastUserMessageRef = useRef<{ content: string; ts: number } | null>(null);
  const isConfigured = aiService.isConfigured();

  // Send message to AI
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !portfolio) return;

    // Deduplicate rapid duplicates (e.g., double click/enter)
    const now = Date.now();
    if (lastUserMessageRef.current &&
        lastUserMessageRef.current.content === message.trim() &&
        (now - lastUserMessageRef.current.ts) < 1000) {
      return;
    }
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    let updatedHistory: AIMessage[] = [];
    setMessages(prev => {
      updatedHistory = [...prev, userMessage];
      return updatedHistory;
    });
    lastUserMessageRef.current = { content: message.trim(), ts: now };

    try {
      const aiResponse = await aiService.chatWithAI(message, portfolio, updatedHistory);
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Error sending message to AI:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [portfolio, aiService]);

  // Analyze portfolio with AI
  const analyzePortfolio = useCallback(async () => {
    if (!portfolio) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await aiService.analyzePortfolio(portfolio, defiOpportunities, stakingPositions);
      setAnalysis(analysisResult);
      
      // Add analysis message to conversation
      const analysisMessage: AIMessage = {
        id: `analysis-${Date.now()}`,
        type: 'ai',
        content: `I've completed a comprehensive analysis of your portfolio. Here's what I found:\n\n**Summary:** ${analysisResult.summary}\n\n**Risk Assessment:** ${analysisResult.riskAssessment}\n\n**Top Opportunities:**\n${analysisResult.opportunities.map(opp => `• ${opp}`).join('\n')}\n\n**Key Recommendations:**\n${analysisResult.recommendations.map(rec => `• ${rec}`).join('\n')}`,
        timestamp: new Date().toISOString(),
        portfolioInsights: analysisResult.insights
      };
      
      setMessages(prev => [...prev, analysisMessage]);
    } catch (err) {
      console.error('Error analyzing portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze portfolio');
    } finally {
      setIsAnalyzing(false);
    }
  }, [portfolio, defiOpportunities, stakingPositions, aiService]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Get recommendations
  const getRecommendations = useCallback(async (query: string) => {
    if (!portfolio) {
      return {
        recommendations: ['Please connect your wallet to get personalized recommendations'],
        reasoning: 'No portfolio data available',
        riskLevel: 'medium' as const
      };
    }

    try {
      return await aiService.getRecommendations(portfolio, query);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      return {
        recommendations: ['Unable to generate recommendations at this time'],
        reasoning: 'Error occurred while generating recommendations',
        riskLevel: 'medium' as const
      };
    }
  }, [portfolio, aiService]);

  return {
    // Data
    messages,
    analysis,
    isConfigured,
    
    // State
    isLoading,
    isAnalyzing,
    error,
    
    // Actions
    sendMessage,
    analyzePortfolio,
    clearConversation,
    getRecommendations,
    
    // Portfolio data
    portfolio,
    defiOpportunities,
    stakingPositions,
  };
};

