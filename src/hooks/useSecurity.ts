import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ContractApproval, SecurityCheck, SecurityService } from '../services/securityService';

export interface UseSecurityReturn {
  approvals: ContractApproval[];
  securityChecks: SecurityCheck[];
  securityScore: number;
  recommendations: string[];
  loading: boolean;
  error: string | null;
  revokeApproval: (approvalId: string) => Promise<void>;
  refreshSecurityData: () => Promise<void>;
}

export const useSecurity = (): UseSecurityReturn => {
  const { address, isConnected } = useAccount();
  
  const [approvals, setApprovals] = useState<ContractApproval[]>([]);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [securityScore, setSecurityScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize security service
  const securityService = new SecurityService();

  // Fetch security data from backend
  const fetchSecurityData = useCallback(async () => {
    if (!isConnected || !address) {
      setApprovals([]);
      setSecurityChecks([]);
      setSecurityScore(0);
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use security service to fetch data
      const [approvalsData, securityChecksData, securityScoreData, recommendationsData] = await Promise.all([
        securityService.getContractApprovals(address),
        securityService.runSecurityChecks(address),
        securityService.getWalletSecurityScore(address),
        securityService.getSecurityRecommendations(address)
      ]);

      setApprovals(approvalsData);
      setSecurityChecks(securityChecksData);
      setSecurityScore(securityScoreData);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Error fetching security data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, securityService]);

  // Revoke approval
  const revokeApproval = useCallback(async (approvalId: string) => {
    if (!address) return;
    
    try {
      // Use security service to revoke approval
      const success = await securityService.revokeApproval(address, approvalId);
      
      if (success) {
        // Remove from local state
        setApprovals(prev => prev.filter(approval => approval.id !== approvalId));
        
        // Refresh security data
        await fetchSecurityData();
      } else {
        throw new Error('Failed to revoke approval');
      }
    } catch (err) {
      console.error('Error revoking approval:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke approval');
    }
  }, [address, securityService, fetchSecurityData]);

  // Refresh security data
  const refreshSecurityData = useCallback(async () => {
    await fetchSecurityData();
  }, [fetchSecurityData]);

  // Initial data fetch
  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  return {
    approvals,
    securityChecks,
    securityScore,
    recommendations,
    loading,
    error,
    revokeApproval,
    refreshSecurityData,
  };
};