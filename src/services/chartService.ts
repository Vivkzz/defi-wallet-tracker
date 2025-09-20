import { Portfolio, Token } from '../types/portfolio';
import { PriceService } from './priceService';

export interface ChartData {
  date: string;
  value: number;
  [key: string]: any;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export class ChartService {
  private priceService: PriceService;

  constructor() {
    this.priceService = new PriceService();
  }

  // Generate portfolio performance chart data
  async generatePortfolioPerformanceChart(portfolio: Portfolio, days: number = 30): Promise<ChartData[]> {
    // This would typically fetch historical data from a backend
    // For now, generate mock data based on current portfolio
    const chartData: ChartData[] = [];
    const today = new Date();
    const totalValue = portfolio.totalValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic portfolio value progression
      const baseValue = totalValue * 0.8; // Start from 80% of current value
      const progress = (days - i) / days;
      const variation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
      
      const value = baseValue * (1 + progress * 0.25 + variation);
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value),
      });
    }

    return chartData;
  }

  // Generate asset allocation pie chart data
  generateAssetAllocationChart(tokens: Token[]): PieChartData[] {
    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    if (totalValue === 0) return [];

    // Define colors for different assets
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
    ];

    return tokens
      .filter(token => token.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 assets
      .map((token, index) => ({
        name: token.symbol,
        value: token.value,
        color: colors[index % colors.length],
      }));
  }

  // Generate token performance comparison chart
  async generateTokenPerformanceChart(tokens: Token[], days: number = 7): Promise<ChartData[]> {
    const chartData: ChartData[] = [];
    const today = new Date();

    // Generate data for each day
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayData: ChartData = {
        date: date.toISOString().split('T')[0],
      };

      // Add performance data for each token
      tokens.forEach(token => {
        const basePrice = token.price;
        const variation = (Math.random() - 0.5) * 0.2; // ±10% daily variation
        const price = basePrice * (1 + variation);
        
        dayData[token.symbol] = price;
      });

      chartData.push(dayData);
    }

    return chartData;
  }

  // Generate risk distribution chart
  generateRiskDistributionChart(tokens: Token[]): PieChartData[] {
    const riskCategories = {
      'Low Risk (80-100)': { min: 80, max: 100, color: '#10B981' },
      'Medium Risk (60-79)': { min: 60, max: 79, color: '#F59E0B' },
      'High Risk (40-59)': { min: 40, max: 59, color: '#EF4444' },
      'Very High Risk (0-39)': { min: 0, max: 39, color: '#DC2626' },
    };

    const distribution: { [key: string]: number } = {};

    tokens.forEach(token => {
      const riskScore = token.riskScore;
      
      for (const [category, range] of Object.entries(riskCategories)) {
        if (riskScore >= range.min && riskScore <= range.max) {
          distribution[category] = (distribution[category] || 0) + token.value;
          break;
        }
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      color: riskCategories[name as keyof typeof riskCategories]?.color || '#6B7280',
    }));
  }

  // Generate chain distribution chart
  generateChainDistributionChart(tokens: Token[]): PieChartData[] {
    const chainDistribution: { [key: string]: number } = {};

    tokens.forEach(token => {
      chainDistribution[token.chain] = (chainDistribution[token.chain] || 0) + token.value;
    });

    const colors = [
      '#3B82F6', // Ethereum - Blue
      '#8B5CF6', // Polygon - Purple
      '#F59E0B', // BSC - Yellow
      '#EF4444', // Avalanche - Red
      '#10B981', // Solana - Green
    ];

    return Object.entries(chainDistribution)
      .sort(([, a], [, b]) => b - a)
      .map(([chain, value], index) => ({
        name: chain,
        value,
        color: colors[index % colors.length],
      }));
  }

  // Generate DeFi yield opportunities chart
  generateDeFiYieldChart(opportunities: Array<{ name: string; apy: number; risk: string }>): ChartData[] {
    return opportunities.map(opportunity => ({
      name: opportunity.name,
      apy: opportunity.apy,
      risk: opportunity.risk,
      color: opportunity.risk === 'Low' ? '#10B981' : 
             opportunity.risk === 'Medium' ? '#F59E0B' : '#EF4444',
    }));
  }

  // Generate portfolio volatility chart
  async generateVolatilityChart(portfolio: Portfolio, days: number = 30): Promise<ChartData[]> {
    const chartData: ChartData[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Calculate daily volatility based on token price changes
      const dailyVolatility = portfolio.tokens.reduce((total, token) => {
        const volatility = Math.abs(token.change24h) / 100; // Convert percentage to decimal
        return total + (volatility * (token.value / portfolio.totalValue));
      }, 0);

      chartData.push({
        date: date.toISOString().split('T')[0],
        volatility: dailyVolatility * 100, // Convert back to percentage
      });
    }

    return chartData;
  }

  // Generate correlation matrix data
  generateCorrelationMatrix(tokens: Token[]): Array<{ token1: string; token2: string; correlation: number }> {
    const correlations: Array<{ token1: string; token2: string; correlation: number }> = [];

    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const token1 = tokens[i];
        const token2 = tokens[j];
        
        // Simplified correlation calculation based on price changes
        // In a real implementation, this would use historical price data
        const correlation = this.calculateCorrelation(token1.change24h, token2.change24h);
        
        correlations.push({
          token1: token1.symbol,
          token2: token2.symbol,
          correlation,
        });
      }
    }

    return correlations;
  }

  // Calculate correlation coefficient
  private calculateCorrelation(x: number, y: number): number {
    // Simplified correlation calculation
    // In a real implementation, this would use proper statistical methods
    const normalizedX = x / 100; // Normalize to -1 to 1 range
    const normalizedY = y / 100;
    
    // Simple correlation based on sign and magnitude
    const correlation = (normalizedX * normalizedY) / (Math.abs(normalizedX) + Math.abs(normalizedY) + 0.1);
    
    return Math.max(-1, Math.min(1, correlation));
  }

  // Generate portfolio heatmap data
  generatePortfolioHeatmap(tokens: Token[]): Array<{ 
    token: string; 
    chain: string; 
    value: number; 
    risk: number; 
    performance: number; 
  }> {
    return tokens.map(token => ({
      token: token.symbol,
      chain: token.chain,
      value: token.value,
      risk: token.riskScore,
      performance: token.change24h,
    }));
  }

  // Export chart data
  exportChartData(chartData: ChartData[], filename: string): void {
    const csv = this.convertToCSV(chartData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Convert chart data to CSV
  private convertToCSV(data: ChartData[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}
