// Example backend server for Omni Folio Guard
// This is a basic Express.js server that could be used for production deployment

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Portfolio endpoints
app.get('/api/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { chain } = req.query;
    
    // Use Covalent API to get real portfolio data
    const covalentApiKey = process.env.COVALENT_API_KEY || 'cqt_rQGcQ4Wf3vK7Rxh3bvmxggyfP4xT';
    const chainId = chain || 'eth-mainnet';
    
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${covalentApiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      // Graceful fallback if Covalent quota exceeded
      if ((data.error_message || '').toLowerCase().includes('credit limit exceeded')) {
        return res.json({
          success: true,
          data: {
            address,
            chain: chainId,
            tokens: [],
            totalValue: 0,
            change24h: 0,
            change24hPercent: 0,
            lastUpdated: new Date().toISOString()
          }
        });
      }
      throw new Error(data.error_message);
    }

    const tokens = (data.data.items || [])
      .map((item, index) => ({
        id: `${item.contract_address || 'native'}-${chainId}-${index}`,
        name: item.contract_name || 'Unknown Token',
        symbol: item.contract_ticker_symbol || 'UNKNOWN',
        balance: parseFloat(item.balance || 0) / (10 ** (item.contract_decimals || 0)),
        price: item.quote_rate || 0,
        value: item.quote || 0,
        change24h: item.quote_rate_24h || 0,
        chain: chainId,
        chainId: chainId,
        logo: item.logo_url,
        decimals: item.contract_decimals || 0,
        contractAddress: item.contract_address || '',
        riskScore: Math.floor(Math.random() * 100) + 1,
        isNative: item.contract_address === null,
      }))
      .filter(token => token.value >= 1);

    const totalValue = tokens.reduce((acc, token) => acc + (token.value || 0), 0);
    const totalValue24h = tokens.reduce((acc, token) => acc + ((token.value || 0) / (1 + (token.change24h || 0) / 100)), 0);
    const change24h = totalValue - totalValue24h;

    const portfolio = {
      address,
      chain: chainId,
      tokens: tokens || [],
      totalValue: totalValue || 0,
      change24h: change24h || 0,
      change24hPercent: totalValue24h > 0 ? (change24h / totalValue24h) * 100 : 0,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Portfolio API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Token price endpoint
app.get('/api/tokens/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // This would fetch real price data
    const mockPrice = {
      price: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20
    };
    
    res.json({
      success: true,
      data: mockPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch token prices endpoint (server-side CoinGecko proxy)
app.post('/api/tokens/prices', async (req, res) => {
  try {
    const { symbols } = req.body || {};
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ success: false, error: 'symbols array is required' });
    }

    // Map common symbols to CoinGecko IDs
    const symbolToId = {
      ETH: 'ethereum', WETH: 'weth', BTC: 'bitcoin', WBTC: 'wrapped-bitcoin',
      USDC: 'usd-coin', USDT: 'tether', DAI: 'dai', BUSD: 'binance-usd',
      BNB: 'binancecoin', MATIC: 'matic-network', AVAX: 'avalanche-2', SOL: 'solana',
      LINK: 'chainlink', UNI: 'uniswap', AAVE: 'aave', COMP: 'compound-governance-token',
      CRV: 'curve-dao-token', CAKE: 'pancakeswap-token', SFUND: 'seedify-fund', ALU: 'altura',
      BETH: 'binance-eth'
    };

    const ids = symbols
      .map(s => symbolToId[(s || '').toUpperCase()] || (s || '').toLowerCase())
      .join(',');

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `CoinGecko HTTP ${response.status}` });
    }
    const data = await response.json();

    // Reverse-map ids back to symbols
    const idToSymbol = Object.fromEntries(Object.entries(symbolToId).map(([k, v]) => [v, k]));
    const prices = {};
    Object.keys(data).forEach(id => {
      const symbol = idToSymbol[id] || id.toUpperCase();
      prices[symbol] = data[id]?.usd || 0;
    });

    return res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Batch price API error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
});

// DeFi opportunities endpoint
app.get('/api/defi/opportunities/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get user's portfolio first
    const portfolioResponse = await fetch(`http://localhost:${PORT}/api/portfolio/${address}`);
    const portfolioData = await portfolioResponse.json();
    
    if (!portfolioData.success) {
      throw new Error('Failed to fetch portfolio data');
    }
    
    const tokens = portfolioData.data.tokens || [];
    const opportunities = [];
    
    // Generate opportunities based on user's holdings
    const tokenSymbols = tokens.map(token => token.symbol);
    
    // ETH opportunities
    if (tokenSymbols.includes('ETH') || tokenSymbols.includes('WETH')) {
      opportunities.push({
        id: 'lido-eth',
        name: 'Lido ETH Staking',
        apy: 4.2 + (Math.random() - 0.5) * 0.4,
        asset: 'ETH',
        risk: 'Low',
        protocol: 'lido',
        minAmount: 0.1,
        lockPeriod: 'No lock',
        description: 'Liquid staking for Ethereum 2.0 with stETH tokens',
        isAvailable: true
      });
      
      opportunities.push({
        id: 'rocket-pool-eth',
        name: 'Rocket Pool ETH',
        apy: 3.9 + (Math.random() - 0.5) * 0.3,
        asset: 'ETH',
        risk: 'Low',
        protocol: 'rocketpool',
        minAmount: 0.1,
        lockPeriod: 'No lock',
        description: 'Decentralized ETH staking with rETH tokens',
        isAvailable: true
      });
    }
    
    // USDC opportunities
    if (tokenSymbols.includes('USDC')) {
      opportunities.push({
        id: 'compound-usdc',
        name: 'Compound USDC',
        apy: 6.8 + (Math.random() - 0.5) * 0.6,
        asset: 'USDC',
        risk: 'Low',
        protocol: 'compound',
        minAmount: 100,
        lockPeriod: 'No lock',
        description: 'Lend USDC on Compound protocol',
        isAvailable: true
      });
      
      opportunities.push({
        id: 'aave-usdc',
        name: 'Aave USDC',
        apy: 5.5 + (Math.random() - 0.5) * 0.5,
        asset: 'USDC',
        risk: 'Low',
        protocol: 'aave',
        minAmount: 100,
        lockPeriod: 'No lock',
        description: 'Lend USDC on Aave protocol',
        isAvailable: true
      });
    }
    
    // BNB opportunities
    if (tokenSymbols.includes('BNB')) {
      opportunities.push({
        id: 'pancakeswap-bnb',
        name: 'PancakeSwap BNB',
        apy: 8.7 + (Math.random() - 0.5) * 1,
        asset: 'BNB',
        risk: 'Medium',
        protocol: 'pancakeswap',
        minAmount: 0.1,
        lockPeriod: 'No lock',
        description: 'Stake BNB on PancakeSwap for CAKE rewards',
        isAvailable: true
      });
    }
    
    // Sort by APY (highest first)
    opportunities.sort((a, b) => b.apy - a.apy);
    
    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    console.error('DeFi opportunities API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Risk analysis endpoint
app.get('/api/risk/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // This would perform comprehensive risk analysis
    const mockRiskAnalysis = {
      score: 75,
      alerts: [
        {
          type: 'concentration',
          severity: 'medium',
          message: 'Portfolio is 60% concentrated in ETH',
          recommendation: 'Consider diversifying across more assets'
        }
      ]
    };
    
    res.json({
      success: true,
      data: mockRiskAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Security endpoint (live on-chain allowances on Ethereum mainnet via public RPC)
app.get('/api/security/:address', async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ success: false, error: 'Invalid address' });
    }

    const { createPublicClient, http, formatUnits, maxUint256 } = require('viem');
    const { mainnet } = require('viem/chains');

    const TOKENS = [
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { address: '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8 },
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
    ];
    const SPENDERS = [
      { address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', name: 'Uniswap V2: Router' },
      { address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', name: 'Uniswap V3: Router' },
      { address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', name: 'Uniswap V3: Router 2' },
      { address: '0x11111112542d85B3EF69AE05771c2dCCff4fAa26', name: '1inch: Router' },
      { address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', name: 'SushiSwap: Router' },
    ];

    const ERC20_ABI = [
      { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [
        { name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }
      ], outputs: [{ name: '', type: 'uint256' }] }
    ];

    const client = createPublicClient({ chain: mainnet, transport: http() });
    const owner = address;
    const approvals = [];

    for (const token of TOKENS) {
      for (const spender of SPENDERS) {
        try {
          const allowance = await client.readContract({
            abi: ERC20_ABI,
            address: token.address,
            functionName: 'allowance',
            args: [owner, spender.address],
          });
          const allowanceBig = BigInt(allowance.toString());
          if (allowanceBig === 0n) continue;
          const formatted = formatUnits(allowanceBig, token.decimals);
          const isUnlimited = allowanceBig >= maxUint256 / 2n;
          approvals.push({
            id: `${token.symbol}-${spender.address}`,
            contractAddress: spender.address,
            contractName: spender.name,
            spenderAddress: spender.address,
            spenderName: spender.name,
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            allowance: formatted,
            unlimited: isUnlimited,
            lastUpdated: new Date().toISOString(),
            chain: 'Ethereum',
            riskLevel: 'low',
          });
        } catch {}
      }
    }

    const securityChecks = [];
    const securityScore = 100 - approvals.filter(a => a.unlimited).length * 10;

    return res.json({
      success: true,
      data: {
        approvals,
        securityChecks,
        securityScore: Math.max(0, securityScore),
        recommendations: approvals.filter(a => a.unlimited).map(() => 'Revoke unlimited approvals and set specific allowance amounts instead')
      }
    });
  } catch (error) {
    console.error('Security API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics endpoint
app.get('/api/analytics/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // This would generate comprehensive analytics
    const mockAnalytics = {
      performance: [],
      allocation: [],
      riskDistribution: [],
      topPerformers: []
    };
    
    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Omni Folio Guard API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
