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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Security endpoint
app.get('/api/security/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Mock security data with some randomization
    const approvals = [
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
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        chain: 'Ethereum',
        riskLevel: 'low'
      }
    ];
    
    const securityChecks = [
      {
        id: 'check-1',
        name: 'Unlimited Token Approvals',
        description: 'Checks for unlimited token approvals that could pose a security risk',
        status: Math.random() > 0.5 ? 'warning' : 'passed',
        severity: 'high',
        recommendation: 'Revoke unlimited approvals and set specific allowance amounts instead'
      },
      {
        id: 'check-2',
        name: 'Suspicious Contract Interactions',
        description: 'Checks for interactions with known suspicious or malicious contracts',
        status: 'passed',
        severity: 'high',
        recommendation: 'Revoke approvals for suspicious contracts and avoid interacting with them'
      },
      {
        id: 'check-3',
        name: 'Hardware Wallet Usage',
        description: 'Checks if a hardware wallet is being used for added security',
        status: Math.random() > 0.3 ? 'failed' : 'passed',
        severity: 'medium',
        recommendation: 'Consider using a hardware wallet for improved security'
      }
    ];
    
    const securityScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    res.json({
      success: true,
      data: {
        approvals,
        securityChecks,
        securityScore,
        recommendations: securityChecks
          .filter(check => check.status !== 'passed')
          .map(check => check.recommendation)
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
