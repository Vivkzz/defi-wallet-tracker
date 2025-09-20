import { PortfolioAlert, Token, Portfolio } from '../types/portfolio';

export class NotificationService {
  private alerts: PortfolioAlert[] = [];
  private listeners: Array<(alerts: PortfolioAlert[]) => void> = [];

  // Subscribe to alert updates
  subscribe(listener: (alerts: PortfolioAlert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notify(): void {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }

  // Add a new alert
  addAlert(alert: Omit<PortfolioAlert, 'id' | 'timestamp' | 'isRead'>): void {
    const newAlert: PortfolioAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.alerts.unshift(newAlert);
    
    // Keep only the last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    this.notify();
  }

  // Mark alert as read
  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.notify();
    }
  }

  // Mark all alerts as read
  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.isRead = true);
    this.notify();
  }

  // Remove an alert
  removeAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.notify();
  }

  // Clear all alerts
  clearAllAlerts(): void {
    this.alerts = [];
    this.notify();
  }

  // Get all alerts
  getAlerts(): PortfolioAlert[] {
    return [...this.alerts];
  }

  // Get unread alerts count
  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.isRead).length;
  }

  // Generate portfolio alerts based on current state
  generatePortfolioAlerts(portfolio: Portfolio, previousPortfolio?: Portfolio): void {
    // Price alerts
    this.checkPriceAlerts(portfolio.tokens, previousPortfolio?.tokens);

    // Risk alerts
    this.checkRiskAlerts(portfolio);

    // Opportunity alerts
    this.checkOpportunityAlerts(portfolio);

    // Volume alerts
    this.checkVolumeAlerts(portfolio.tokens, previousPortfolio?.tokens);
  }

  // Check for price alerts
  private checkPriceAlerts(currentTokens: Token[], previousTokens?: Token[]): void {
    if (!previousTokens) return;

    currentTokens.forEach(currentToken => {
      const previousToken = previousTokens.find(t => t.id === currentToken.id);
      if (!previousToken) return;

      const priceChange = ((currentToken.price - previousToken.price) / previousToken.price) * 100;

      // Alert for significant price changes
      if (Math.abs(priceChange) > 10) {
        this.addAlert({
          type: 'price',
          title: `${currentToken.symbol} Price Alert`,
          message: `${currentToken.symbol} price ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange).toFixed(2)}%`,
          severity: Math.abs(priceChange) > 20 ? 'high' : 'medium',
        });
      }
    });
  }

  // Check for risk alerts
  private checkRiskAlerts(portfolio: Portfolio): void {
    const highRiskTokens = portfolio.tokens.filter(token => token.riskScore < 40);
    
    if (highRiskTokens.length > 0) {
      this.addAlert({
        type: 'risk',
        title: 'High Risk Tokens Detected',
        message: `${highRiskTokens.length} token(s) in your portfolio have high risk scores`,
        severity: 'high',
      });
    }

    // Check for concentration risk
    const totalValue = portfolio.totalValue;
    if (totalValue > 0) {
      const topToken = portfolio.tokens.reduce((max, token) => 
        token.value > max.value ? token : max, portfolio.tokens[0]);
      
      const concentration = (topToken.value / totalValue) * 100;
      
      if (concentration > 50) {
        this.addAlert({
          type: 'risk',
          title: 'Portfolio Concentration Risk',
          message: `Portfolio is ${concentration.toFixed(1)}% concentrated in ${topToken.symbol}`,
          severity: concentration > 80 ? 'high' : 'medium',
        });
      }
    }
  }

  // Check for opportunity alerts
  private checkOpportunityAlerts(portfolio: Portfolio): void {
    // Check for tokens with high potential for staking
    const stakableTokens = portfolio.tokens.filter(token => 
      ['ETH', 'SOL', 'MATIC', 'AVAX'].includes(token.symbol) && token.value > 100
    );

    if (stakableTokens.length > 0) {
      this.addAlert({
        type: 'opportunity',
        title: 'Staking Opportunities Available',
        message: `You have ${stakableTokens.length} token(s) that can be staked for additional yield`,
        severity: 'low',
      });
    }
  }

  // Check for volume alerts
  private checkVolumeAlerts(currentTokens: Token[], previousTokens?: Token[]): void {
    if (!previousTokens) return;

    currentTokens.forEach(currentToken => {
      const previousToken = previousTokens.find(t => t.id === currentToken.id);
      if (!previousToken) return;

      const valueChange = currentToken.value - previousToken.value;
      const valueChangePercent = (valueChange / previousToken.value) * 100;

      // Alert for significant value changes
      if (Math.abs(valueChangePercent) > 25) {
        this.addAlert({
          type: 'volume',
          title: `${currentToken.symbol} Position Change`,
          message: `Your ${currentToken.symbol} position ${valueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(valueChangePercent).toFixed(1)}%`,
          severity: Math.abs(valueChangePercent) > 50 ? 'high' : 'medium',
        });
      }
    });
  }

  // Create custom alert
  createCustomAlert(
    type: PortfolioAlert['type'],
    title: string,
    message: string,
    severity: PortfolioAlert['severity'] = 'medium'
  ): void {
    this.addAlert({ type, title, message, severity });
  }

  // Get alerts by type
  getAlertsByType(type: PortfolioAlert['type']): PortfolioAlert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: PortfolioAlert['severity']): PortfolioAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Get recent alerts (last 24 hours)
  getRecentAlerts(): PortfolioAlert[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.alerts.filter(alert => new Date(alert.timestamp) > oneDayAgo);
  }

  // Export alerts (for backup or analysis)
  exportAlerts(): string {
    return JSON.stringify(this.alerts, null, 2);
  }

  // Import alerts (from backup)
  importAlerts(alertsJson: string): void {
    try {
      const importedAlerts = JSON.parse(alertsJson);
      if (Array.isArray(importedAlerts)) {
        this.alerts = importedAlerts;
        this.notify();
      }
    } catch (error) {
      console.error('Failed to import alerts:', error);
    }
  }
}
