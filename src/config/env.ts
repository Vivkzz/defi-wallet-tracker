// Environment configuration
export const config = {
  // API Keys
  covalentApiKey: import.meta.env.VITE_COVALENT_API_KEY || "cqt_rQGcQ4Wf3vK7Rxh3bvmxggyfP4xT",
  etherscanApiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || "",
  coingeckoApiKey: import.meta.env.VITE_COINGECKO_API_KEY || "",
  moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY || "",
  alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "",

  // Supported Chains (Focused on Ethereum and BSC)
  supportedChains: [
    { id: 'eth-mainnet', name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth-mainnet.g.alchemy.com/v2/' },
    { id: 'bsc-mainnet', name: 'BSC', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org/' },
  ],

  // Default Settings
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000'),
  maxTokensPerChain: parseInt(import.meta.env.VITE_MAX_TOKENS_PER_CHAIN || '100'),

  // Risk Analysis Thresholds
  riskThresholds: {
    low: parseInt(import.meta.env.VITE_RISK_THRESHOLD_LOW || '80'),
    medium: parseInt(import.meta.env.VITE_RISK_THRESHOLD_MEDIUM || '60'),
    high: parseInt(import.meta.env.VITE_RISK_THRESHOLD_HIGH || '40'),
  },

  // DeFi Protocols (Focused on Ethereum and BSC)
  defiProtocols: [
    { name: 'Lido', apy: 4.2, asset: 'ETH', risk: 'Low', protocol: 'lido' },
    { name: 'Compound', apy: 6.8, asset: 'USDC', risk: 'Low', protocol: 'compound' },
    { name: 'Aave', apy: 5.5, asset: 'USDT', risk: 'Low', protocol: 'aave' },
    { name: 'Uniswap V3', apy: 12.3, asset: 'ETH/USDC', risk: 'Medium', protocol: 'uniswap' },
    { name: 'PancakeSwap', apy: 8.7, asset: 'BNB', risk: 'Medium', protocol: 'pancakeswap' },
    { name: 'Venus', apy: 7.5, asset: 'BNB', risk: 'Medium', protocol: 'venus' },
  ],
};
