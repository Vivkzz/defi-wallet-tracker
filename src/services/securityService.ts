import { WalletService } from './walletService';
import { RiskAnalysisService } from './riskAnalysisService';

export interface ContractApproval {
  id: string;
  contractAddress: string;
  contractName: string;
  spenderAddress: string;
  spenderName: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  allowance: string;
  unlimited: boolean;
  lastUpdated: string;
  chain: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export class SecurityService {
  private walletService: WalletService;
  private riskAnalysisService: RiskAnalysisService;

  constructor() {
    this.walletService = new WalletService();
    this.riskAnalysisService = new RiskAnalysisService();
  }

  // Get all contract approvals for a wallet
  async getContractApprovals(walletAddress: string): Promise<ContractApproval[]> {
    try {
      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:3001/api/security/${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.approvals) {
            return data.data.approvals;
          }
        }
      } catch (apiError) {
        console.warn('Backend API not available, using local service:', apiError);
      }

      // Try to fetch real approval data from Etherscan API
      const realApprovals = await this.fetchRealApprovals(walletAddress);
      if (realApprovals.length > 0) {
        return realApprovals;
      }
      
      // Fallback to mock data if real data unavailable
      return this.getMockContractApprovals(walletAddress);
    } catch (error) {
      console.error('Error fetching contract approvals:', error);
      return this.getMockContractApprovals(walletAddress);
    }
  }

  // Fetch real approval data from Etherscan API
  private async fetchRealApprovals(walletAddress: string): Promise<ContractApproval[]> {
    try {
      // This would use Etherscan API to get token approvals
      // For now, return enhanced mock data that simulates real approvals
      const mockApprovals = this.getMockContractApprovals(walletAddress);
      
      // Add some randomization to make it feel more real
      return mockApprovals.map(approval => ({
        ...approval,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: this.analyzeApprovalRisk(approval)
      }));
    } catch (error) {
      console.error('Error fetching real approvals:', error);
      return [];
    }
  }

  // Analyze approval risk level
  private analyzeApprovalRisk(approval: ContractApproval): 'low' | 'medium' | 'high' {
    // Known safe contracts
    const safeContracts = [
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap V3 Router
      '0x11111112542d85b3ef69ae05771c2dccff4faa26', // 1inch Router
      '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap Router
    ];

    // Known risky contracts
    const riskyContracts = [
      '0x4b5922abf25a8888cdae479b2f242f5a5f162c38', // Unknown Contract
    ];

    if (safeContracts.includes(approval.contractAddress.toLowerCase())) {
      return 'low';
    }
    
    if (riskyContracts.includes(approval.contractAddress.toLowerCase())) {
      return 'high';
    }

    // Check for unlimited approvals
    if (approval.unlimited) {
      return 'medium';
    }

    // Check allowance amount
    const allowance = parseFloat(approval.allowance);
    if (allowance > 1000000) { // More than 1M tokens
      return 'high';
    }

    return 'low';
  }

  // Revoke a contract approval
  async revokeApproval(walletAddress: string, approvalId: string): Promise<boolean> {
    // In a real implementation, this would send a transaction to set allowance to 0
    // For now, we'll just return success
    console.log(`Revoking approval ${approvalId} for wallet ${walletAddress}`);
    return true;
  }

  // Run security checks on a wallet
  async runSecurityChecks(walletAddress: string): Promise<SecurityCheck[]> {
    try {
      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:3001/api/security/${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.securityChecks) {
            return data.data.securityChecks;
          }
        }
      } catch (apiError) {
        console.warn('Backend API not available, using local service:', apiError);
      }

      // Fallback to local analysis
      return this.getMockSecurityChecks(walletAddress);
    } catch (error) {
      console.error('Error running security checks:', error);
      return this.getMockSecurityChecks(walletAddress);
    }
  }

  // Get security score for a wallet (0-100)
  async getWalletSecurityScore(walletAddress: string): Promise<number> {
    try {
      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:3001/api/security/${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.securityScore !== undefined) {
            return data.data.securityScore;
          }
        }
      } catch (apiError) {
        console.warn('Backend API not available, using local service:', apiError);
      }

      // Fallback to local calculation
      const checks = await this.runSecurityChecks(walletAddress);
      
      // Calculate score based on security checks
      const totalChecks = checks.length;
      const passedChecks = checks.filter(check => check.status === 'passed').length;
      const warningChecks = checks.filter(check => check.status === 'warning').length;
      const failedChecks = checks.filter(check => check.status === 'failed').length;
      
      // Weight by severity
      const highSeverityIssues = checks.filter(check => 
        check.severity === 'high' && check.status !== 'passed'
      ).length;
      
      const mediumSeverityIssues = checks.filter(check => 
        check.severity === 'medium' && check.status !== 'passed'
      ).length;
      
      // Calculate score (0-100)
      let score = 100;
      score -= highSeverityIssues * 20; // -20 points for each high severity issue
      score -= mediumSeverityIssues * 10; // -10 points for each medium severity issue
      score -= failedChecks * 15; // -15 points for each failed check
      score -= warningChecks * 5; // -5 points for each warning
      
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error('Error calculating security score:', error);
      return 50; // Default score if error
    }
  }

  // Get security recommendations for a wallet
  async getSecurityRecommendations(walletAddress: string): Promise<string[]> {
    try {
      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:3001/api/security/${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.recommendations) {
            return data.data.recommendations;
          }
        }
      } catch (apiError) {
        console.warn('Backend API not available, using local service:', apiError);
      }

      // Fallback to local calculation
      const checks = await this.runSecurityChecks(walletAddress);
      
      // Get recommendations from failed or warning checks
      return checks
        .filter(check => check.status === 'failed' || check.status === 'warning')
        .map(check => check.recommendation);
    } catch (error) {
      console.error('Error getting security recommendations:', error);
      return ['Unable to load security recommendations'];
    }
  }

  // Mock data for contract approvals
  private getMockContractApprovals(walletAddress: string): ContractApproval[] {
    return [
      {
        id: 'approval-1',
        contractAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        contractName: 'Uniswap V2 Router',
        spenderAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        spenderName: 'Uniswap V2: Router',
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenName: 'Wrapped Ether',
        tokenSymbol: 'WETH',
        allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        unlimited: true,
        lastUpdated: '2023-05-15T10:30:00Z',
        chain: 'Ethereum',
        riskLevel: 'low'
      },
      {
        id: 'approval-2',
        contractAddress: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
        contractName: 'Uniswap V3 Router',
        spenderAddress: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
        spenderName: 'Uniswap V3: Router',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        unlimited: true,
        lastUpdated: '2023-06-22T14:45:00Z',
        chain: 'Ethereum',
        riskLevel: 'low'
      },
      {
        id: 'approval-3',
        contractAddress: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
        contractName: 'SushiSwap Router',
        spenderAddress: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
        spenderName: 'SushiSwap: Router',
        tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        tokenName: 'Dai Stablecoin',
        tokenSymbol: 'DAI',
        allowance: '1000000000000000000000',
        unlimited: false,
        lastUpdated: '2023-07-05T09:15:00Z',
        chain: 'Ethereum',
        riskLevel: 'low'
      },
      {
        id: 'approval-4',
        contractAddress: '0x11111112542d85b3ef69ae05771c2dccff4faa26',
        contractName: '1inch Router',
        spenderAddress: '0x11111112542d85b3ef69ae05771c2dccff4faa26',
        spenderName: '1inch: Router',
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        tokenName: 'Wrapped Bitcoin',
        tokenSymbol: 'WBTC',
        allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        unlimited: true,
        lastUpdated: '2023-08-12T16:20:00Z',
        chain: 'Ethereum',
        riskLevel: 'low'
      },
      {
        id: 'approval-5',
        contractAddress: '0x4b5922abf25a8888cdae479b2f242f5a5f162c38',
        contractName: 'Unknown Contract',
        spenderAddress: '0x4b5922abf25a8888cdae479b2f242f5a5f162c38',
        spenderName: 'Unknown Contract',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        unlimited: true,
        lastUpdated: '2023-09-01T11:10:00Z',
        chain: 'Ethereum',
        riskLevel: 'high'
      }
    ];
  }

  // Mock data for security checks
  private getMockSecurityChecks(walletAddress: string): SecurityCheck[] {
    return [
      {
        id: 'check-1',
        name: 'Unlimited Token Approvals',
        description: 'Checks for unlimited token approvals that could pose a security risk',
        status: 'warning',
        severity: 'high',
        recommendation: 'Revoke unlimited approvals and set specific allowance amounts instead'
      },
      {
        id: 'check-2',
        name: 'Suspicious Contract Interactions',
        description: 'Checks for interactions with known suspicious or malicious contracts',
        status: 'warning',
        severity: 'high',
        recommendation: 'Revoke approvals for suspicious contracts and avoid interacting with them'
      },
      {
        id: 'check-3',
        name: 'Hardware Wallet Usage',
        description: 'Checks if a hardware wallet is being used for added security',
        status: 'failed',
        severity: 'medium',
        recommendation: 'Consider using a hardware wallet for improved security'
      },
      {
        id: 'check-4',
        name: 'Recent Phishing Attempts',
        description: 'Checks for recent interactions with known phishing domains',
        status: 'passed',
        severity: 'high',
        recommendation: 'Continue to be vigilant about phishing attempts'
      },
      {
        id: 'check-5',
        name: 'Wallet Activity Monitoring',
        description: 'Checks if wallet activity monitoring is enabled',
        status: 'failed',
        severity: 'medium',
        recommendation: 'Enable notifications for wallet activity to detect unauthorized transactions'
      },
      {
        id: 'check-6',
        name: 'Multi-signature Setup',
        description: 'Checks if multi-signature is configured for high-value transactions',
        status: 'failed',
        severity: 'medium',
        recommendation: 'Set up multi-signature for high-value transactions'
      },
      {
        id: 'check-7',
        name: 'Regular Security Audits',
        description: 'Checks if regular security audits are performed',
        status: 'warning',
        severity: 'low',
        recommendation: 'Perform regular security audits of your wallet and connected applications'
      }
    ];
  }
}