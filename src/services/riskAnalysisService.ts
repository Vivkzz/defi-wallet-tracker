import { Token, Portfolio, PortfolioAnalytics } from '../types/portfolio';

export class RiskAnalysisService {
  // Calculate overall portfolio risk score
  calculatePortfolioRisk(portfolio: Portfolio): number {
    if (portfolio.tokens.length === 0) return 0;

    const tokenRisks = portfolio.tokens.map(token => token.riskScore);
    const weightedRisk = this.calculateWeightedRisk(portfolio.tokens);
    const diversificationRisk = this.calculateDiversificationRisk(portfolio.tokens);
    const concentrationRisk = this.calculateConcentrationRisk(portfolio.tokens);

    // Weighted average of different risk factors
    const overallRisk = (
      weightedRisk * 0.4 +
      diversificationRisk * 0.3 +
      concentrationRisk * 0.3
    );

    return Math.round(overallRisk);
  }

  // Calculate weighted risk based on token values
  private calculateWeightedRisk(tokens: Token[]): number {
    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    if (totalValue === 0) return 0;

    const weightedSum = tokens.reduce((sum, token) => {
      const weight = token.value / totalValue;
      return sum + (token.riskScore * weight);
    }, 0);

    return weightedSum;
  }

  // Calculate diversification risk
  private calculateDiversificationRisk(tokens: Token[]): number {
    if (tokens.length <= 1) return 100; // High risk if only one token

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    if (totalValue === 0) return 100;

    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = tokens.reduce((sum, token) => {
      const marketShare = token.value / totalValue;
      return sum + (marketShare * marketShare);
    }, 0);

    // Convert HHI to risk score (0-100)
    // HHI of 1 (monopoly) = 100 risk, HHI of 0.1 (10 equal tokens) = 10 risk
    const diversificationRisk = Math.min(100, hhi * 100);

    return diversificationRisk;
  }

  // Calculate concentration risk
  private calculateConcentrationRisk(tokens: Token[]): number {
    if (tokens.length === 0) return 0;

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    if (totalValue === 0) return 0;

    // Sort tokens by value (descending)
    const sortedTokens = [...tokens].sort((a, b) => b.value - a.value);

    // Calculate risk based on top 3 holdings concentration
    const top3Value = sortedTokens.slice(0, 3).reduce((sum, token) => sum + token.value, 0);
    const top3Percentage = (top3Value / totalValue) * 100;

    // Higher concentration = higher risk
    if (top3Percentage > 80) return 90;
    if (top3Percentage > 60) return 70;
    if (top3Percentage > 40) return 50;
    if (top3Percentage > 20) return 30;
    return 10;
  }

  // Analyze individual token risk
  analyzeTokenRisk(token: Token): {
    score: number;
    factors: {
      liquidity: number;
      volatility: number;
      marketCap: number;
      age: number;
      contract: number;
    };
    recommendations: string[];
  } {
    const factors = {
      liquidity: this.analyzeLiquidity(token),
      volatility: this.analyzeVolatility(token),
      marketCap: this.analyzeMarketCap(token),
      age: this.analyzeTokenAge(token),
      contract: this.analyzeContract(token),
    };

    const score = Math.round(
      (factors.liquidity + factors.volatility + factors.marketCap + factors.age + factors.contract) / 5
    );

    const recommendations = this.generateTokenRecommendations(token, factors);

    return { score, factors, recommendations };
  }

  private analyzeLiquidity(token: Token): number {
    // Simplified liquidity analysis based on 24h change
    if (token.change24h === 0) return 50; // Neutral if no data
    
    const volatility = Math.abs(token.change24h);
    if (volatility < 5) return 80; // Low volatility = good liquidity
    if (volatility < 15) return 60; // Medium volatility
    if (volatility < 30) return 40; // High volatility
    return 20; // Very high volatility = poor liquidity
  }

  private analyzeVolatility(token: Token): number {
    // Analyze based on 24h price change
    const volatility = Math.abs(token.change24h);
    if (volatility < 2) return 90; // Very stable
    if (volatility < 5) return 70; // Stable
    if (volatility < 10) return 50; // Moderate
    if (volatility < 20) return 30; // Volatile
    return 10; // Very volatile
  }

  private analyzeMarketCap(token: Token): number {
    // Simplified market cap analysis based on token value
    if (token.value < 100) return 20; // Very small position
    if (token.value < 1000) return 40; // Small position
    if (token.value < 10000) return 60; // Medium position
    if (token.value < 100000) return 80; // Large position
    return 90; // Very large position
  }

  private analyzeTokenAge(token: Token): number {
    // Simplified age analysis - in real implementation, this would check contract creation date
    // For now, assume newer tokens are riskier
    if (token.contractAddress === '0x0000000000000000000000000000000000000000') return 90; // Native token
    return 60; // Default for contract tokens
  }

  private analyzeContract(token: Token): number {
    // Simplified contract analysis
    if (token.isNative) return 90; // Native tokens are safest
    if (token.contractAddress && token.contractAddress !== '0x0000000000000000000000000000000000000000') {
      return 70; // Contract exists
    }
    return 30; // No contract or invalid address
  }

  private generateTokenRecommendations(token: Token, factors: any): string[] {
    const recommendations: string[] = [];

    if (factors.liquidity < 40) {
      recommendations.push('Low liquidity detected - consider reducing position size');
    }

    if (factors.volatility < 30) {
      recommendations.push('High volatility - monitor closely and consider stop-loss');
    }

    if (factors.marketCap < 40) {
      recommendations.push('Small position size - consider increasing if confident in token');
    }

    if (factors.contract < 50) {
      recommendations.push('Contract risk detected - verify token authenticity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Token appears to be in good standing');
    }

    return recommendations;
  }

  // Generate portfolio analytics
  generatePortfolioAnalytics(portfolio: Portfolio): PortfolioAnalytics {
    const tokens = portfolio.tokens;
    const totalValue = portfolio.totalValue;
    const change24h = portfolio.change24h;

    // Calculate 7d and 30d changes (mock data for now)
    const change7d = change24h * 7 * (0.8 + Math.random() * 0.4); // ±20% variation
    const change30d = change24h * 30 * (0.7 + Math.random() * 0.6); // ±30% variation

    // Find best and worst performers
    const bestPerformer = tokens.reduce((best, current) => 
      current.change24h > best.change24h ? current : best, tokens[0] || {} as Token);
    
    const worstPerformer = tokens.reduce((worst, current) => 
      current.change24h < worst.change24h ? current : worst, tokens[0] || {} as Token);

    // Calculate risk score
    const riskScore = this.calculatePortfolioRisk(portfolio);

    // Calculate diversification score
    const diversification = this.calculateDiversificationScore(tokens);

    // Get top holdings (top 5 by value)
    const topHoldings = [...tokens]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalValue: totalValue || 0,
      change24h: change24h || 0,
      change7d: change7d || 0,
      change30d: change30d || 0,
      bestPerformer: bestPerformer || {} as Token,
      worstPerformer: worstPerformer || {} as Token,
      riskScore: riskScore || 0,
      diversification: diversification || 0,
      topHoldings: topHoldings || [],
    };
  }

  private calculateDiversificationScore(tokens: Token[]): number {
    if (tokens.length <= 1) return 0;

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    if (totalValue === 0) return 0;

    // Calculate entropy-based diversification score
    const entropy = tokens.reduce((sum, token) => {
      const proportion = token.value / totalValue;
      return sum - (proportion * Math.log2(proportion));
    }, 0);

    // Normalize to 0-100 scale
    const maxEntropy = Math.log2(tokens.length);
    return Math.round((entropy / maxEntropy) * 100);
  }

  // Detect potential risks and generate alerts
  generateRiskAlerts(portfolio: Portfolio): Array<{
    type: 'concentration' | 'volatility' | 'liquidity' | 'diversification';
    severity: 'low' | 'medium' | 'high';
    message: string;
    recommendation: string;
  }> {
    const alerts: Array<{
      type: 'concentration' | 'volatility' | 'liquidity' | 'diversification';
      severity: 'low' | 'medium' | 'high';
      message: string;
      recommendation: string;
    }> = [];

    const totalValue = portfolio.totalValue;
    if (totalValue === 0) return alerts;

    // Check concentration risk
    const sortedTokens = [...portfolio.tokens].sort((a, b) => b.value - a.value);
    const topTokenValue = sortedTokens[0]?.value || 0;
    const topTokenPercentage = (topTokenValue / totalValue) * 100;

    if (topTokenPercentage > 50) {
      alerts.push({
        type: 'concentration',
        severity: topTokenPercentage > 80 ? 'high' : topTokenPercentage > 65 ? 'medium' : 'low',
        message: `Portfolio is ${topTokenPercentage.toFixed(1)}% concentrated in ${sortedTokens[0]?.symbol}`,
        recommendation: 'Consider diversifying across more assets to reduce concentration risk',
      });
    }

    // Check volatility risk
    const highVolatilityTokens = portfolio.tokens.filter(token => Math.abs(token.change24h) > 20);
    if (highVolatilityTokens.length > 0) {
      alerts.push({
        type: 'volatility',
        severity: highVolatilityTokens.length > 2 ? 'high' : 'medium',
        message: `${highVolatilityTokens.length} token(s) showing high volatility (>20%)`,
        recommendation: 'Monitor volatile positions closely and consider risk management strategies',
      });
    }

    // Check diversification
    const diversificationScore = this.calculateDiversificationScore(portfolio.tokens);
    if (diversificationScore < 30) {
      alerts.push({
        type: 'diversification',
        severity: diversificationScore < 15 ? 'high' : 'medium',
        message: 'Portfolio lacks diversification',
        recommendation: 'Consider adding assets from different sectors or chains',
      });
    }

    return alerts;
  }
}
