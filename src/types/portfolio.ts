export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  chain: string;
  chainId: string;
  logo?: string;
  decimals: number;
  contractAddress: string;
  riskScore: number;
  isNative: boolean;
}

export interface NFT {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  tokenId: string;
  chain: string;
  chainId: string;
  imageUrl?: string;
  floorPrice: number;
  lastSalePrice: number;
  rarity: number;
  authenticity: boolean;
}

export interface Portfolio {
  address: string;
  chain: string;
  tokens: Token[];
  totalValue: number;
  change24h: number;
  change24hPercent: number;
  lastUpdated: string;
}

export interface Chain {
  id: string;
  name: string;
  symbol: string;
  rpc: string;
}

export interface DeFiOpportunity {
  id: string;
  name: string;
  apy: number;
  asset: string;
  risk: 'Low' | 'Medium' | 'High';
  protocol: string;
  minAmount: number;
  lockPeriod: string;
  description: string;
  isAvailable: boolean;
}

export interface PortfolioAlert {
  id: string;
  type: 'price' | 'volume' | 'risk' | 'opportunity';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  isRead: boolean;
}

export interface PortfolioAnalytics {
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  bestPerformer: Token;
  worstPerformer: Token;
  riskScore: number;
  diversification: number;
  topHoldings: Token[];
}

export interface StakingPosition {
  id: string;
  protocol: string;
  asset: string;
  amount: number;
  apy: number;
  rewards: number;
  lockPeriod?: string;
  unlockDate?: string;
  status: 'active' | 'pending' | 'unlocked';
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  from: string;
  to: string;
  amount: number;
  asset: string;
  value: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
}

export interface Wallet {
  id: string;
  address: string;
  name: string;
  type: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom';
  isConnected: boolean;
  lastUsed: string;
}

export interface PortfolioSettings {
  defaultCurrency: string;
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
  display: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showCharts: boolean;
  };
}
