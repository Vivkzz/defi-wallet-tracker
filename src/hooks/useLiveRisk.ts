import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { LiveRiskService, LiveRiskAlert, LiveRiskMetrics } from '../services/liveRiskService';
import { Portfolio } from '../types/portfolio';

export interface UseLiveRiskReturn {
  // Data
  riskAlerts: LiveRiskAlert[];
  riskMetrics: LiveRiskMetrics | null;
  riskPreventionTips: string[];
  riskSupportResources: Array<{ title: string; description: string; url: string }>;
  
  // State
  isMonitoring: boolean;
  lastUpdate: string | null;
  
  // Actions
  startMonitoring: (portfolio: Portfolio) => void;
  stopMonitoring: () => void;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  refreshRiskData: () => void;
}

export const useLiveRisk = (): UseLiveRiskReturn => {
  const { address, isConnected } = useAccount();
  
  // State
  const [riskAlerts, setRiskAlerts] = useState<LiveRiskAlert[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<LiveRiskMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Services
  const liveRiskService = useRef(new LiveRiskService()).current;
  
  // Risk prevention tips and support resources
  const riskPreventionTips = liveRiskService.getRiskPreventionTips();
  const riskSupportResources = liveRiskService.getRiskSupportResources();

  // Start monitoring
  const startMonitoring = useCallback((portfolio: Portfolio) => {
    if (!isConnected || !address) return;
    
    liveRiskService.startMonitoring(portfolio, 30000); // Check every 30 seconds
    setIsMonitoring(true);
  }, [isConnected, address, liveRiskService]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    liveRiskService.stopMonitoring();
    setIsMonitoring(false);
  }, [liveRiskService]);

  // Mark alert as read
  const markAlertAsRead = useCallback((alertId: string) => {
    liveRiskService.markAlertAsRead(alertId);
  }, [liveRiskService]);

  // Mark all alerts as read
  const markAllAlertsAsRead = useCallback(() => {
    liveRiskService.markAllAlertsAsRead();
  }, [liveRiskService]);

  // Refresh risk data
  const refreshRiskData = useCallback(() => {
    const alerts = liveRiskService.getRiskAlerts();
    const metrics = liveRiskService.getRiskMetrics();
    
    setRiskAlerts(alerts);
    setRiskMetrics(metrics);
    setLastUpdate(new Date().toISOString());
  }, [liveRiskService]);

  // Subscribe to risk updates
  useEffect(() => {
    const unsubscribe = liveRiskService.subscribe((alerts, metrics) => {
      setRiskAlerts(alerts);
      setRiskMetrics(metrics);
      setLastUpdate(new Date().toISOString());
    });

    return unsubscribe;
  }, [liveRiskService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      liveRiskService.stopMonitoring();
    };
  }, [liveRiskService]);

  // Stop monitoring when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      stopMonitoring();
    }
  }, [isConnected, stopMonitoring]);

  return {
    // Data
    riskAlerts,
    riskMetrics,
    riskPreventionTips,
    riskSupportResources,
    
    // State
    isMonitoring,
    lastUpdate,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    markAlertAsRead,
    markAllAlertsAsRead,
    refreshRiskData,
  };
};
