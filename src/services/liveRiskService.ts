import { Token, Portfolio } from '../types/portfolio';

export interface LiveRiskAlert {
  id: string;
  type: 'price_volatility' | 'liquidity_drop' | 'concentration_risk' | 'security_threat' | 'market_crash';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendation: string;
  timestamp: string;
  isRead: boolean;
  tokenSymbol?: string;
  currentValue?: number;
  thresholdValue?: number;
}

export interface LiveRiskMetrics {
  portfolioRiskScore: number;
  volatilityIndex: number;
  liquidityScore: number;
  concentrationRisk: number;
  securityScore: number;
  lastUpdated: string;
}

export class LiveRiskService {
  private riskAlerts: LiveRiskAlert[] = [];
  private riskMetrics: LiveRiskMetrics | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private subscribers: ((alerts: LiveRiskAlert[], metrics: LiveRiskMetrics | null) => void)[] = [];

  // Start live risk monitoring
  startMonitoring(portfolio: Portfolio, intervalMs: number = 30000) {
    this.stopMonitoring(); // Stop any existing monitoring
    
    // Initial risk assessment
    this.assessPortfolioRisk(portfolio);
    
    // Set up interval for continuous monitoring
    this.monitoringInterval = setInterval(() => {
      this.assessPortfolioRisk(portfolio);
    }, intervalMs);
  }

  // Stop live risk monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Subscribe to risk updates
  subscribe(callback: (alerts: LiveRiskAlert[], metrics: LiveRiskMetrics | null) => void) {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Get current risk alerts
  getRiskAlerts(): LiveRiskAlert[] {
    return [...this.riskAlerts];
  }

  // Get current risk metrics
  getRiskMetrics(): LiveRiskMetrics | null {
    return this.riskMetrics;
  }

  // Mark alert as read
  markAlertAsRead(alertId: string) {
    const alert = this.riskAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.notifySubscribers();
    }
  }

  // Mark all alerts as read
  markAllAlertsAsRead() {
    this.riskAlerts.forEach(alert => {
      alert.isRead = true;
    });
    this.notifySubscribers();
  }

  // Assess portfolio risk
  private async assessPortfolioRisk(portfolio: Portfolio) {
    try {
      const metrics = this.calculateRiskMetrics(portfolio);
      const alerts = await this.generateRiskAlerts(portfolio, metrics);
      
      this.riskMetrics = metrics;
      this.riskAlerts = alerts;
      
      this.notifySubscribers();
    } catch (error) {
      console.error('Error assessing portfolio risk:', error);
    }
  }

  // Calculate risk metrics
  private calculateRiskMetrics(portfolio: Portfolio): LiveRiskMetrics {
    const tokens = portfolio.tokens || [];
    const totalValue = portfolio.totalValue || 0;

    // Portfolio Risk Score (0-100, higher = riskier)
    const portfolioRiskScore = this.calculatePortfolioRiskScore(tokens, totalValue);

    // Volatility Index (0-100, higher = more volatile)
    const volatilityIndex = this.calculateVolatilityIndex(tokens);

    // Liquidity Score (0-100, higher = more liquid)
    const liquidityScore = this.calculateLiquidityScore(tokens);

    // Concentration Risk (0-100, higher = more concentrated)
    const concentrationRisk = this.calculateConcentrationRisk(tokens, totalValue);

    // Security Score (0-100, higher = more secure)
    const securityScore = this.calculateSecurityScore(tokens);

    return {
      portfolioRiskScore,
      volatilityIndex,
      liquidityScore,
      concentrationRisk,
      securityScore,
      lastUpdated: new Date().toISOString()
    };
  }

  // Calculate portfolio risk score
  private calculatePortfolioRiskScore(tokens: Token[], totalValue: number): number {
    if (tokens.length === 0 || totalValue === 0) return 0;

    // Weighted average of individual token risk scores
    const weightedRisk = tokens.reduce((sum, token) => {
      const weight = token.value / totalValue;
      return sum + (token.riskScore * weight);
    }, 0);

    return Math.round(weightedRisk);
  }

  // Calculate volatility index
  private calculateVolatilityIndex(tokens: Token[]): number {
    if (tokens.length === 0) return 0;

    // Average absolute 24h change
    const avgVolatility = tokens.reduce((sum, token) => {
      return sum + Math.abs(token.change24h || 0);
    }, 0) / tokens.length;

    // Convert to 0-100 scale
    return Math.min(100, Math.round(avgVolatility * 2));
  }

  // Calculate liquidity score
  private calculateLiquidityScore(tokens: Token[]): number {
    if (tokens.length === 0) return 0;

    // Based on token values and volatility
    const avgValue = tokens.reduce((sum, token) => sum + token.value, 0) / tokens.length;
    const avgVolatility = tokens.reduce((sum, token) => sum + Math.abs(token.change24h || 0), 0) / tokens.length;

    // Higher value and lower volatility = higher liquidity score
    const valueScore = Math.min(100, (avgValue / 1000) * 50); // Scale based on $1000
    const volatilityScore = Math.max(0, 50 - (avgVolatility * 2));

    return Math.round((valueScore + volatilityScore) / 2);
  }

  // Calculate concentration risk
  private calculateConcentrationRisk(tokens: Token[], totalValue: number): number {
    if (tokens.length === 0 || totalValue === 0) return 0;

    // Calculate Herfindahl-Hirschman Index
    const hhi = tokens.reduce((sum, token) => {
      const marketShare = token.value / totalValue;
      return sum + (marketShare * marketShare);
    }, 0);

    // Convert to 0-100 scale
    return Math.round(hhi * 100);
  }

  // Calculate security score
  private calculateSecurityScore(tokens: Token[]): number {
    if (tokens.length === 0) return 0;

    // Average of individual token security scores
    const avgSecurity = tokens.reduce((sum, token) => {
      return sum + (token.riskScore || 50);
    }, 0) / tokens.length;

    return Math.round(avgSecurity);
  }

  // Generate risk alerts
  private async generateRiskAlerts(portfolio: Portfolio, metrics: LiveRiskMetrics): Promise<LiveRiskAlert[]> {
    const alerts: LiveRiskAlert[] = [];
    const tokens = portfolio.tokens || [];
    const totalValue = portfolio.totalValue || 0;

    // Price volatility alerts
    const highVolatilityTokens = tokens.filter(token => Math.abs(token.change24h || 0) > 20);
    if (highVolatilityTokens.length > 0) {
      alerts.push({
        id: `volatility-${Date.now()}`,
        type: 'price_volatility',
        severity: highVolatilityTokens.length > 2 ? 'high' : 'medium',
        title: 'High Price Volatility Detected',
        message: `${highVolatilityTokens.length} token(s) showing >20% price movement in 24h`,
        recommendation: 'Consider reducing position sizes or setting stop-loss orders',
        timestamp: new Date().toISOString(),
        isRead: false,
        tokenSymbol: highVolatilityTokens[0].symbol
      });
    }

    // Concentration risk alerts
    if (metrics.concentrationRisk > 70) {
      const topToken = tokens.reduce((max, token) => token.value > max.value ? token : max, tokens[0]);
      alerts.push({
        id: `concentration-${Date.now()}`,
        type: 'concentration_risk',
        severity: metrics.concentrationRisk > 85 ? 'high' : 'medium',
        title: 'High Portfolio Concentration',
        message: `Portfolio is ${((topToken.value / totalValue) * 100).toFixed(1)}% concentrated in ${topToken.symbol}`,
        recommendation: 'Consider diversifying across more assets to reduce concentration risk',
        timestamp: new Date().toISOString(),
        isRead: false,
        tokenSymbol: topToken.symbol,
        currentValue: (topToken.value / totalValue) * 100,
        thresholdValue: 70
      });
    }

    // Liquidity alerts
    if (metrics.liquidityScore < 30) {
      alerts.push({
        id: `liquidity-${Date.now()}`,
        type: 'liquidity_drop',
        severity: metrics.liquidityScore < 15 ? 'high' : 'medium',
        title: 'Low Liquidity Detected',
        message: 'Portfolio shows signs of low liquidity',
        recommendation: 'Consider holding more liquid assets or reducing position sizes',
        timestamp: new Date().toISOString(),
        isRead: false,
        currentValue: metrics.liquidityScore,
        thresholdValue: 30
      });
    }

    // Security alerts
    if (metrics.securityScore < 40) {
      alerts.push({
        id: `security-${Date.now()}`,
        type: 'security_threat',
        severity: metrics.securityScore < 20 ? 'critical' : 'high',
        title: 'Security Risk Detected',
        message: 'Portfolio contains high-risk or potentially suspicious tokens',
        recommendation: 'Review token contracts and consider removing high-risk positions',
        timestamp: new Date().toISOString(),
        isRead: false,
        currentValue: metrics.securityScore,
        thresholdValue: 40
      });
    }

    // Market crash simulation (for demo purposes)
    if (Math.random() < 0.05) { // 5% chance every check
      alerts.push({
        id: `market-crash-${Date.now()}`,
        type: 'market_crash',
        severity: 'critical',
        title: 'Market Volatility Alert',
        message: 'High market volatility detected across multiple assets',
        recommendation: 'Consider reducing exposure or moving to stable assets',
        timestamp: new Date().toISOString(),
        isRead: false
      });
    }

    return alerts;
  }

  // Notify subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback([...this.riskAlerts], this.riskMetrics);
    });
  }

  // Get risk prevention tips
  getRiskPreventionTips(): string[] {
    return [
      'Diversify your portfolio across different asset classes and chains',
      'Set stop-loss orders for volatile positions',
      'Regularly review and revoke unnecessary token approvals',
      'Keep only small amounts in hot wallets, use hardware wallets for large amounts',
      'Monitor your portfolio regularly for unusual activity',
      'Avoid investing more than you can afford to lose',
      'Research tokens thoroughly before investing',
      'Use dollar-cost averaging to reduce timing risk',
      'Keep emergency funds in stable assets',
      'Stay updated with market news and regulatory changes'
    ];
  }

  // Get risk support resources
  getRiskSupportResources(): Array<{ title: string; description: string; url: string }> {
    return [
      {
        title: 'DeFi Safety Guidelines',
        description: 'Learn about DeFi security best practices',
        url: 'https://defisafety.com/'
      },
      {
        title: 'Token Approval Revocation',
        description: 'Revoke unnecessary token approvals',
        url: 'https://revoke.cash/'
      },
      {
        title: 'Portfolio Risk Calculator',
        description: 'Calculate your portfolio risk metrics',
        url: 'https://portfolio-risk-calculator.com/'
      },
      {
        title: 'Emergency Response Guide',
        description: 'What to do if your wallet is compromised',
        url: 'https://wallet-security-guide.com/'
      }
    ];
  }
}
