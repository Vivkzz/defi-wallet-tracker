import { Portfolio, Token, NFT, DeFiOpportunity, PortfolioAnalytics } from '../types/portfolio';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class ApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Portfolio endpoints
  async getPortfolio(address: string, chainId?: string): Promise<ApiResponse<Portfolio>> {
    const endpoint = chainId 
      ? `/portfolio/${address}/${chainId}`
      : `/portfolio/${address}`;
    
    return this.request<Portfolio>(endpoint);
  }

  async getMultiChainPortfolio(address: string): Promise<ApiResponse<Portfolio[]>> {
    return this.request<Portfolio[]>(`/portfolio/${address}/multi-chain`);
  }

  async getPortfolioHistory(
    address: string, 
    days: number = 30
  ): Promise<ApiResponse<Array<{ date: string; value: number }>>> {
    return this.request<Array<{ date: string; value: number }>>(
      `/portfolio/${address}/history?days=${days}`
    );
  }

  async getPortfolioAnalytics(address: string): Promise<ApiResponse<PortfolioAnalytics>> {
    return this.request<PortfolioAnalytics>(`/portfolio/${address}/analytics`);
  }

  // Token endpoints
  async getTokenInfo(symbol: string): Promise<ApiResponse<Token>> {
    return this.request<Token>(`/tokens/${symbol}`);
  }

  async getTokenPrice(symbol: string): Promise<ApiResponse<{ price: number; change24h: number }>> {
    return this.request<{ price: number; change24h: number }>(`/tokens/${symbol}/price`);
  }

  async getTokenPrices(symbols: string[]): Promise<ApiResponse<{ [key: string]: number }>> {
    return this.request<{ [key: string]: number }>('/tokens/prices', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  }

  async getTokenHistory(
    symbol: string, 
    days: number = 30
  ): Promise<ApiResponse<Array<{ date: string; price: number }>>> {
    return this.request<Array<{ date: string; price: number }>>(
      `/tokens/${symbol}/history?days=${days}`
    );
  }

  // NFT endpoints
  async getNFTPortfolio(address: string, chainId: string): Promise<ApiResponse<NFT[]>> {
    return this.request<NFT[]>(`/nft/${address}/${chainId}`);
  }

  async getNFTInfo(contractAddress: string, tokenId: string): Promise<ApiResponse<NFT>> {
    return this.request<NFT>(`/nft/${contractAddress}/${tokenId}`);
  }

  async getNFTFloorPrice(contractAddress: string): Promise<ApiResponse<{ floorPrice: number }>> {
    return this.request<{ floorPrice: number }>(`/nft/${contractAddress}/floor-price`);
  }

  // DeFi endpoints
  async getDeFiOpportunities(address: string): Promise<ApiResponse<DeFiOpportunity[]>> {
    return this.request<DeFiOpportunity[]>(`/defi/opportunities/${address}`);
  }

  async getStakingPositions(address: string): Promise<ApiResponse<Array<{
    id: string;
    protocol: string;
    asset: string;
    amount: number;
    apy: number;
    rewards: number;
    status: string;
  }>>> {
    return this.request<Array<{
      id: string;
      protocol: string;
      asset: string;
      amount: number;
      apy: number;
      rewards: number;
      status: string;
    }>>(`/defi/staking/${address}`);
  }

  async getProtocolInfo(protocol: string): Promise<ApiResponse<{
    name: string;
    apy: number;
    risk: string;
    description: string;
    website: string;
  }>> {
    return this.request<{
      name: string;
      apy: number;
      risk: string;
      description: string;
      website: string;
    }>(`/defi/protocols/${protocol}`);
  }

  // Risk analysis endpoints
  async analyzeTokenRisk(tokenAddress: string): Promise<ApiResponse<{
    score: number;
    factors: {
      liquidity: number;
      volatility: number;
      marketCap: number;
      age: number;
      contract: number;
    };
    recommendations: string[];
  }>> {
    return this.request<{
      score: number;
      factors: {
        liquidity: number;
        volatility: number;
        marketCap: number;
        age: number;
        contract: number;
      };
      recommendations: string[];
    }>(`/risk/token/${tokenAddress}`);
  }

  async analyzePortfolioRisk(address: string): Promise<ApiResponse<{
    score: number;
    alerts: Array<{
      type: string;
      severity: string;
      message: string;
      recommendation: string;
    }>;
  }>> {
    return this.request<{
      score: number;
      alerts: Array<{
        type: string;
        severity: string;
        message: string;
        recommendation: string;
      }>;
    }>(`/risk/portfolio/${address}`);
  }

  // Market data endpoints
  async getMarketData(): Promise<ApiResponse<{
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    fearGreedIndex: number;
  }>> {
    return this.request<{
      totalMarketCap: number;
      totalVolume: number;
      btcDominance: number;
      fearGreedIndex: number;
    }>('/market/overview');
  }

  async getTrendingTokens(): Promise<ApiResponse<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume24h: number;
  }>>> {
    return this.request<Array<{
      symbol: string;
      name: string;
      price: number;
      change24h: number;
      volume24h: number;
    }>>('/market/trending');
  }

  // User preferences endpoints
  async getUserPreferences(userId: string): Promise<ApiResponse<{
    currency: string;
    refreshInterval: number;
    notifications: {
      priceAlerts: boolean;
      riskAlerts: boolean;
      opportunityAlerts: boolean;
    };
    privacy: {
      hideSmallBalances: boolean;
      hideZeroBalances: boolean;
      minBalanceThreshold: number;
    };
  }>> {
    return this.request<{
      currency: string;
      refreshInterval: number;
      notifications: {
        priceAlerts: boolean;
        riskAlerts: boolean;
        opportunityAlerts: boolean;
      };
      privacy: {
        hideSmallBalances: boolean;
        hideZeroBalances: boolean;
        minBalanceThreshold: number;
      };
    }>(`/user/${userId}/preferences`);
  }

  async updateUserPreferences(
    userId: string, 
    preferences: any
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/user/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Watchlist endpoints
  async getWatchlist(userId: string): Promise<ApiResponse<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    addedAt: string;
  }>>> {
    return this.request<Array<{
      symbol: string;
      name: string;
      price: number;
      change24h: number;
      addedAt: string;
    }>>(`/user/${userId}/watchlist`);
  }

  async addToWatchlist(userId: string, symbol: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/user/${userId}/watchlist`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/user/${userId}/watchlist/${symbol}`, {
      method: 'DELETE',
    });
  }

  // Alerts endpoints
  async getAlerts(userId: string): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    severity: string;
    timestamp: string;
    isRead: boolean;
  }>>> {
    return this.request<Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      severity: string;
      timestamp: string;
      isRead: boolean;
    }>>(`/user/${userId}/alerts`);
  }

  async markAlertAsRead(userId: string, alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/user/${userId}/alerts/${alertId}/read`, {
      method: 'PUT',
    });
  }

  // Analytics endpoints
  async getPortfolioAnalytics(
    address: string,
    timeframe: string = '30d'
  ): Promise<ApiResponse<{
    performance: Array<{ date: string; value: number }>;
    allocation: Array<{ name: string; value: number; color: string }>;
    riskDistribution: Array<{ name: string; value: number; color: string }>;
    topPerformers: Array<{ symbol: string; change24h: number }>;
  }>> {
    return this.request<{
      performance: Array<{ date: string; value: number }>;
      allocation: Array<{ name: string; value: number; color: string }>;
      riskDistribution: Array<{ name: string; value: number; color: string }>;
      topPerformers: Array<{ symbol: string; change24h: number }>;
    }>(`/analytics/portfolio/${address}?timeframe=${timeframe}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Get API status
  async getApiStatus(): Promise<ApiResponse<{
    version: string;
    uptime: number;
    endpoints: Array<{ name: string; status: string; responseTime: number }>;
  }>> {
    return this.request<{
      version: string;
      uptime: number;
      endpoints: Array<{ name: string; status: string; responseTime: number }>;
    }>('/status');
  }
}
