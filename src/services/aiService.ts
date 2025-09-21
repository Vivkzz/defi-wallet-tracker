import { Portfolio, Token, DeFiOpportunity, StakingPosition } from '../types/portfolio';
import { config } from '../config/env';

export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
  portfolioInsights?: PortfolioInsight[];
}

export interface PortfolioInsight {
  type: 'risk' | 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionItems?: string[];
}

export interface AIPortfolioAnalysis {
  summary: string;
  riskAssessment: string;
  opportunities: string[];
  recommendations: string[];
  insights: PortfolioInsight[];
  marketOutlook: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = config.geminiApiKey;
  }

  // Check if API key is available
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get AI portfolio analysis
  async analyzePortfolio(portfolio: Portfolio, defiOpportunities: DeFiOpportunity[], stakingPositions: StakingPosition[]): Promise<AIPortfolioAnalysis> {
    if (!this.isConfigured()) {
      return this.getMockAnalysis(portfolio);
    }

    try {
      const prompt = this.buildPortfolioAnalysisPrompt(portfolio, defiOpportunities, stakingPositions);
      const response = await this.callGeminiAPI(prompt);
      return this.parsePortfolioAnalysis(response);
    } catch (error) {
      console.error('Error analyzing portfolio with AI:', error);
      return this.getMockAnalysis(portfolio);
    }
  }

  // Chat with AI about portfolio
  async chatWithAI(message: string, portfolio: Portfolio, conversationHistory: AIMessage[]): Promise<AIMessage> {
    if (!this.isConfigured()) {
      return this.getMockResponse(message, portfolio);
    }

    try {
      const prompt = this.buildChatPrompt(message, portfolio, conversationHistory);
      const response = await this.callGeminiAPI(prompt);
      return this.parseChatResponse(response);
    } catch (error) {
      console.error('Error chatting with AI:', error);
      return this.getMockResponse(message, portfolio);
    }
  }

  // Get portfolio recommendations
  async getRecommendations(portfolio: Portfolio, userQuery: string): Promise<{
    recommendations: string[];
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    if (!this.isConfigured()) {
      return this.getMockRecommendations(portfolio, userQuery);
    }

    try {
      const prompt = this.buildRecommendationPrompt(portfolio, userQuery);
      const response = await this.callGeminiAPI(prompt);
      return this.parseRecommendations(response);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return this.getMockRecommendations(portfolio, userQuery);
    }
  }

  // Call Gemini API
  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Build portfolio analysis prompt
  private buildPortfolioAnalysisPrompt(portfolio: Portfolio, defiOpportunities: DeFiOpportunity[], stakingPositions: StakingPosition[]): string {
    const portfolioData = {
      totalValue: portfolio.totalValue,
      change24h: portfolio.change24h,
      change24hPercent: portfolio.change24hPercent,
      tokens: portfolio.tokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        value: token.value,
        change24h: token.change24h,
        riskScore: token.riskScore
      })),
      defiOpportunities: defiOpportunities.map(opp => ({
        name: opp.name,
        apy: opp.apy,
        asset: opp.asset,
        risk: opp.risk,
        protocol: opp.protocol
      })),
      stakingPositions: stakingPositions.map(pos => ({
        protocol: pos.protocol,
        asset: pos.asset,
        amount: pos.amount,
        apy: pos.apy,
        rewards: pos.rewards
      }))
    };

    return `You are an expert DeFi portfolio manager and financial advisor. Analyze the following portfolio data and provide comprehensive insights:

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Please provide:
1. A brief summary of the portfolio's current state
2. Risk assessment with specific concerns
3. Top 3 opportunities for improvement
4. 5 actionable recommendations
5. Market outlook and trends to watch
6. Specific insights about token allocation and diversification

Format your response as JSON with the following structure:
{
  "summary": "Brief portfolio summary",
  "riskAssessment": "Risk analysis",
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "insights": [
    {
      "type": "risk|opportunity|warning|recommendation",
      "title": "Insight title",
      "description": "Detailed description",
      "severity": "low|medium|high",
      "actionItems": ["action1", "action2"]
    }
  ],
  "marketOutlook": "Market analysis and trends"
}`;
  }

  // Build chat prompt
  private buildChatPrompt(message: string, portfolio: Portfolio, conversationHistory: AIMessage[]): string {
    const recentHistory = conversationHistory.slice(-5).map(msg => 
      `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n');

    const portfolioSummary = {
      totalValue: portfolio.totalValue,
      tokens: portfolio.tokens.map(t => `${t.symbol}: ${t.balance} ($${t.value.toFixed(2)})`),
      change24h: portfolio.change24h
    };

    return `You are an expert DeFi portfolio manager AI assistant. The user is asking about their portfolio.

Current Portfolio:
${JSON.stringify(portfolioSummary, null, 2)}

Recent Conversation:
${recentHistory}

User's Question: ${message}

Please provide a helpful, specific response about their portfolio. If they're asking for advice, be practical and actionable. If they're asking about specific tokens or strategies, provide detailed explanations. Always consider their current holdings and risk profile.

Respond in a conversational but professional tone. If you need more information to give a good answer, ask clarifying questions.`;
  }

  // Build recommendation prompt
  private buildRecommendationPrompt(portfolio: Portfolio, userQuery: string): string {
    const portfolioData = {
      totalValue: portfolio.totalValue,
      tokens: portfolio.tokens.map(token => ({
        symbol: token.symbol,
        value: token.value,
        change24h: token.change24h,
        riskScore: token.riskScore
      }))
    };

    return `As a DeFi portfolio manager, provide specific recommendations based on this query: "${userQuery}"

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Provide:
1. 3-5 specific recommendations
2. Reasoning behind each recommendation
3. Risk level assessment (low/medium/high)

Format as JSON:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "reasoning": "Detailed reasoning",
  "riskLevel": "low|medium|high"
}`;
  }

  // Parse portfolio analysis response
  private parsePortfolioAnalysis(response: string): AIPortfolioAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || 'Portfolio analysis completed',
        riskAssessment: parsed.riskAssessment || 'Risk assessment not available',
        opportunities: parsed.opportunities || [],
        recommendations: parsed.recommendations || [],
        insights: parsed.insights || [],
        marketOutlook: parsed.marketOutlook || 'Market outlook not available'
      };
    } catch (error) {
      console.error('Error parsing portfolio analysis:', error);
      return this.getMockAnalysis({} as Portfolio);
    }
  }

  // Parse chat response
  private parseChatResponse(response: string): AIMessage {
    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: response,
      timestamp: new Date().toISOString()
    };
  }

  // Parse recommendations response
  private parseRecommendations(response: string): {
    recommendations: string[];
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        recommendations: parsed.recommendations || [],
        reasoning: parsed.reasoning || 'No reasoning provided',
        riskLevel: parsed.riskLevel || 'medium'
      };
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return {
        recommendations: ['Consider diversifying your portfolio'],
        reasoning: 'Unable to parse AI response',
        riskLevel: 'medium'
      };
    }
  }

  // Mock analysis for when API is not available
  private getMockAnalysis(portfolio: Portfolio): AIPortfolioAnalysis {
    return {
      summary: `Your portfolio is worth $${portfolio.totalValue?.toFixed(2) || '0'} with ${portfolio.tokens?.length || 0} different tokens. ${portfolio.change24h && portfolio.change24h > 0 ? 'It has gained' : 'It has lost'} ${Math.abs(portfolio.change24hPercent || 0).toFixed(2)}% in the last 24 hours.`,
      riskAssessment: 'Your portfolio shows moderate risk levels. Consider diversifying across different asset classes and chains.',
      opportunities: [
        'Consider staking your ETH for 4-5% APY',
        'Diversify into stablecoins for lower volatility',
        'Explore DeFi yield farming opportunities'
      ],
      recommendations: [
        'Set up stop-loss orders for volatile positions',
        'Regularly review and rebalance your portfolio',
        'Consider dollar-cost averaging for new investments',
        'Keep emergency funds in stable assets',
        'Stay updated with market news and trends'
      ],
      insights: [
        {
          type: 'recommendation',
          title: 'Portfolio Diversification',
          description: 'Your portfolio could benefit from more diversification across different sectors and chains.',
          severity: 'medium',
          actionItems: ['Add tokens from different sectors', 'Consider multi-chain exposure']
        }
      ],
      marketOutlook: 'The DeFi market continues to evolve with new opportunities and risks. Stay informed and manage risk appropriately.'
    };
  }

  // Mock chat response
  private getMockResponse(message: string, portfolio: Portfolio): AIMessage {
    const responses = [
      "I'd be happy to help you with your portfolio! However, I need the Gemini API key to provide AI-powered insights. Please configure your API key in the environment variables.",
      "Your portfolio looks interesting! To give you the best advice, I need access to the Gemini API. Please set up your VITE_GEMINI_API_KEY environment variable.",
      "I can see you have a portfolio worth $" + (portfolio.totalValue?.toFixed(2) || '0') + ". For detailed AI analysis, please configure the Gemini API key."
    ];
    
    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString()
    };
  }

  // Mock recommendations
  private getMockRecommendations(portfolio: Portfolio, userQuery: string): {
    recommendations: string[];
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    return {
      recommendations: [
        'Consider diversifying your portfolio across different asset classes',
        'Set up regular portfolio reviews and rebalancing',
        'Keep emergency funds in stable assets like USDC'
      ],
      reasoning: 'These recommendations help reduce risk and improve long-term portfolio performance.',
      riskLevel: 'medium'
    };
  }
}
