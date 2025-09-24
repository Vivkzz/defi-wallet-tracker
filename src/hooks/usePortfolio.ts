import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { PortfolioService } from '../services/portfolioService';
import { RiskAnalysisService } from '../services/riskAnalysisService';
import { DeFiService } from '../services/defiService';
import { PriceService } from '../services/priceService';
import { NotificationService } from '../services/notificationService';
import { SettingsService } from '../services/settingsService';
import { Portfolio, Token, DeFiOpportunity, PortfolioAnalytics, PortfolioAlert } from '../types/portfolio';

export interface UsePortfolioReturn {
  // Data
  portfolio: Portfolio | null;
  analytics: PortfolioAnalytics | null;
  defiOpportunities: DeFiOpportunity[];
  alerts: PortfolioAlert[];
  chartData: {
    performance: Array<{ date: string; value: number }>;
    assetAllocation: Array<{ name: string; value: number; color: string }>;
    riskDistribution: Array<{ name: string; value: number; color: string }>;
  };
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  refreshPortfolio: () => Promise<void>;
  clearError: () => void;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  removeAlert: (alertId: string) => void;
  
  // Settings
  settings: any;
  updateSettings: (updates: any) => void;
}

export const usePortfolio = (): UsePortfolioReturn => {
  const { address, isConnected } = useAccount();
  
  // Services
  const portfolioService = useRef(new PortfolioService()).current;
  const riskAnalysisService = useRef(new RiskAnalysisService()).current;
  const defiService = useRef(new DeFiService()).current;
  const priceService = useRef(new PriceService()).current;
  const notificationService = useRef(new NotificationService()).current;
  const settingsService = useRef(new SettingsService()).current;
  
  // State
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [defiOpportunities, setDefiOpportunities] = useState<DeFiOpportunity[]>([]);
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [chartData, setChartData] = useState({
    performance: [] as Array<{ date: string; value: number }>,
    assetAllocation: [] as Array<{ name: string; value: number; color: string }>,
    riskDistribution: [] as Array<{ name: string; value: number; color: string }>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [settings, setSettings] = useState(settingsService.getSettings());
  
  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPortfolioRef = useRef<Portfolio | null>(null);

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!isConnected || !address) {
      setPortfolio(null);
      setAnalytics(null);
      setDefiOpportunities([]);
      setAlerts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:3001/api/portfolio/${address}`);
        const data = await response.json();
        
        if (data.success) {
          // If backend returns empty (e.g., Covalent quota), fallback to local aggregation
          const basePortfolio = (data.data && data.data.tokens && data.data.tokens.length > 0)
            ? data.data
            : await portfolioService.getAggregatedPortfolio(address);

          setPortfolio(basePortfolio);
          setLastUpdated(new Date().toISOString());
          
          // Generate analytics
          const portfolioAnalytics = riskAnalysisService.generatePortfolioAnalytics(basePortfolio);
          setAnalytics(portfolioAnalytics);

          // Generate chart data
          const performanceData = await portfolioService.getPortfolioHistory(address, 30);
          const assetAllocationData = portfolioService.generateAssetAllocationData(basePortfolio.tokens);
          const riskDistributionData = portfolioService.generateRiskDistributionData(basePortfolio.tokens);
          
          setChartData({
            performance: performanceData,
            assetAllocation: assetAllocationData,
            riskDistribution: riskDistributionData,
          });

          // Get DeFi opportunities from backend
          const defiResponse = await fetch(`http://localhost:3001/api/defi/opportunities/${address}`);
          const defiData = await defiResponse.json();
          
          if (defiData.success) {
            setDefiOpportunities(defiData.data);
          } else {
            // Fallback to local service
            const opportunities = await defiService.getDeFiOpportunities(data.data.tokens);
            setDefiOpportunities(opportunities);
          }

          // Generate alerts based on portfolio changes
          if (previousPortfolioRef.current) {
            notificationService.generatePortfolioAlerts(basePortfolio, previousPortfolioRef.current);
          }
          previousPortfolioRef.current = basePortfolio;
          
          return;
        }
      } catch (apiError) {
        console.warn('Backend API not available, using local services:', apiError);
      }

      // Fallback to local services
      const portfolioData = await portfolioService.getAggregatedPortfolio(address);
      setPortfolio(portfolioData);
      setLastUpdated(new Date().toISOString());

      // Generate analytics
      const portfolioAnalytics = riskAnalysisService.generatePortfolioAnalytics(portfolioData);
      setAnalytics(portfolioAnalytics);

      // Generate chart data
      const performanceData = await portfolioService.getPortfolioHistory(address, 30);
      const assetAllocationData = portfolioService.generateAssetAllocationData(portfolioData.tokens);
      const riskDistributionData = portfolioService.generateRiskDistributionData(portfolioData.tokens);
      
      setChartData({
        performance: performanceData,
        assetAllocation: assetAllocationData,
        riskDistribution: riskDistributionData,
      });

      // Get DeFi opportunities only if portfolio has tokens
      if (portfolioData.tokens && portfolioData.tokens.length > 0) {
        const opportunities = await defiService.getDeFiOpportunities(portfolioData.tokens);
        setDefiOpportunities(opportunities);
      } else {
        setDefiOpportunities([]);
      }

      // Generate alerts based on portfolio changes
      if (previousPortfolioRef.current) {
        notificationService.generatePortfolioAlerts(portfolioData, previousPortfolioRef.current);
      }
      previousPortfolioRef.current = portfolioData;

    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError(error instanceof Error ? error.message : 'Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, portfolioService, riskAnalysisService, defiService, notificationService]);

  // Refresh portfolio
  const refreshPortfolio = useCallback(async () => {
    await fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mark alert as read (and remove it from the frontend)
  const markAlertAsRead = useCallback((alertId: string) => {
    notificationService.removeAlert(alertId);
  }, [notificationService]);

  // Mark all alerts as read (and remove them from the frontend)
  const markAllAlertsAsRead = useCallback(() => {
    notificationService.clearAllAlerts();
  }, [notificationService]);

  // Remove alert
  const removeAlert = useCallback((alertId: string) => {
    notificationService.removeAlert(alertId);
  }, [notificationService]);

  // Update settings
  const updateSettings = useCallback((updates: any) => {
    settingsService.updateSettings(updates);
  }, [settingsService]);

  // Setup refresh interval
  useEffect(() => {
    if (isConnected && address && settings.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchPortfolioData();
      }, settings.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isConnected, address, settings.refreshInterval, fetchPortfolioData]);

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newAlerts) => {
      setAlerts(newAlerts);
    });

    return unsubscribe;
  }, [notificationService]);

  // Subscribe to settings updates
  useEffect(() => {
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, [settingsService]);

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // Data
    portfolio,
    analytics,
    defiOpportunities,
    alerts,
    chartData,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refreshPortfolio,
    clearError,
    markAlertAsRead,
    markAllAlertsAsRead,
    removeAlert,
    
    // Settings
    settings,
    updateSettings,
  };
};
