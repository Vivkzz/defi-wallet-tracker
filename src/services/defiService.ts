import { DeFiOpportunity, Token, StakingPosition } from '../types/portfolio';
import { config } from '../config/env';

// Define supported platforms for APY rates
const SUPPORTED_PLATFORMS = [
  'Lido',
  'Compound',
  'Aave',
  'Uniswap',
  'PancakeSwap',
  'Marinade',
  'Curve',
  'Yearn',
  'Convex',
  'Balancer'
];

// Define token-platform APY mappings
interface TokenApyMapping {
  [tokenSymbol: string]: {
    [platform: string]: number;
  }
}

export class DeFiService {
  private tokenApyMappings: TokenApyMapping = {
    'ETH': {
      'Lido': 4.2,
      'Compound': 2.1,
      'Aave': 1.8,
      'Rocket Pool': 3.9,
      'Stakewise': 4.0
    },
    'WETH': {
      'Lido': 4.2,
      'Compound': 2.1,
      'Aave': 1.8
    },
    'USDC': {
      'Compound': 6.8,
      'Aave': 5.5,
      'Curve': 4.2,
      'Yearn': 7.1
    },
    'USDT': {
      'Compound': 6.5,
      'Aave': 5.2,
      'Curve': 4.0
    },
    'BTC': {
      'Compound': 1.2,
      'Aave': 1.0
    },
    'WBTC': {
      'Compound': 1.2,
      'Aave': 1.0
    },
    'DAI': {
      'Compound': 6.3,
      'Aave': 5.0,
      'Curve': 3.8
    },
    'SOL': {
      'Marinade': 7.1,
      'Lido': 6.8
    },
    'BNB': {
      'PancakeSwap': 8.7,
      'Binance Earn': 5.2
    },
    'MATIC': {
      'Aave': 5.8,
      'Balancer': 7.2
    },
    'AVAX': {
      'Aave': 4.5,
      'Benqi': 6.2
    },
    'LINK': {
      'Aave': 2.5,
      'Compound': 2.2
    },
    'UNI': {
      'Uniswap': 3.5,
      'Compound': 1.8
    },
    'CAKE': {
      'PancakeSwap': 12.5
    },
    'AAVE': {
      'Aave': 3.2
    },
    'CRV': {
      'Curve': 15.8,
      'Convex': 18.2
    },
    'CVX': {
      'Convex': 22.5
    }
  };

  // Get DeFi opportunities based on user's portfolio
  async getDeFiOpportunities(tokens: Token[]): Promise<DeFiOpportunity[]> {
    const opportunities: DeFiOpportunity[] = [];
    
    // Safety check for tokens array
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return opportunities;
    }
    
    // Get token-specific opportunities for each token in portfolio
    for (const token of tokens) {
      const tokenOpportunities = await this.getTokenOpportunities(token);
      opportunities.push(...tokenOpportunities);
    }

    // Get live APY data from DeFiPulse or similar
    const liveOpportunities = await this.getLiveDeFiOpportunities(tokens);
    opportunities.push(...liveOpportunities);

    // Remove duplicates and sort by APY (highest first)
    const uniqueOpportunities = opportunities.filter((opportunity, index, self) =>
      index === self.findIndex((o) => o.id === opportunity.id)
    );
    
    return uniqueOpportunities.sort((a, b) => b.apy - a.apy);
  }
  
  // Get all APY opportunities for a specific token
  async getTokenOpportunities(token: Token): Promise<DeFiOpportunity[]> {
    const opportunities: DeFiOpportunity[] = [];
    const tokenSymbol = token.symbol;
    
    // Check if we have APY data for this token
    if (this.tokenApyMappings[tokenSymbol]) {
      const platforms = Object.keys(this.tokenApyMappings[tokenSymbol]);
      
      for (const platform of platforms) {
        const baseApy = this.tokenApyMappings[tokenSymbol][platform];
        // Add some variation to simulate real-time changes
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const currentApy = Math.max(0.1, baseApy * (1 + variation));
        
        opportunities.push({
          id: `${platform}-${tokenSymbol}`,
          name: `${platform} ${tokenSymbol}`,
          apy: currentApy,
          asset: tokenSymbol,
          risk: this.getRiskLevel(platform),
          protocol: platform,
          minAmount: this.getMinAmount(tokenSymbol),
          lockPeriod: this.getLockPeriod(platform),
          description: this.getProtocolDescription(platform),
          isAvailable: true,
        });
      }
    }
    
    return opportunities;
  }

  // Get risk level for a platform
  private getRiskLevel(platform: string): 'Low' | 'Medium' | 'High' {
    const lowRiskPlatforms = ['Lido', 'Compound', 'Aave', 'Rocket Pool', 'Binance Earn'];
    const mediumRiskPlatforms = ['Curve', 'Uniswap', 'Balancer', 'Marinade', 'Stakewise', 'Yearn', 'Benqi'];
    const highRiskPlatforms = ['PancakeSwap', 'Convex', 'Sushi'];
    
    if (lowRiskPlatforms.includes(platform)) return 'Low';
    if (mediumRiskPlatforms.includes(platform)) return 'Medium';
    if (highRiskPlatforms.includes(platform)) return 'High';
    
    return 'Medium'; // Default risk level
  }
  
  // Get all available APY opportunities for all supported tokens
  async getAllDefiOpportunities(): Promise<DeFiOpportunity[]> {
    const opportunities: DeFiOpportunity[] = [];
    
    // Iterate through all tokens in our mapping
    for (const tokenSymbol of Object.keys(this.tokenApyMappings)) {
      const platforms = Object.keys(this.tokenApyMappings[tokenSymbol]);
      
      for (const platform of platforms) {
        const baseApy = this.tokenApyMappings[tokenSymbol][platform];
        // Add some variation to simulate real-time changes
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const currentApy = Math.max(0.1, baseApy * (1 + variation));
        
        opportunities.push({
          id: `${platform}-${tokenSymbol}`,
          name: `${platform} ${tokenSymbol}`,
          apy: currentApy,
          asset: tokenSymbol,
          risk: this.getRiskLevel(platform),
          protocol: platform,
          minAmount: this.getMinAmount(tokenSymbol),
          lockPeriod: this.getLockPeriod(platform),
          description: this.getProtocolDescription(platform),
          isAvailable: true,
        });
      }
    }
    
    // Sort by APY (highest first)
    return opportunities.sort((a, b) => b.apy - a.apy);
  }

  // Get minimum amount for staking
  private getMinAmount(asset: string): number {
    const minAmounts: { [key: string]: number } = {
      'ETH': 0.1,
      'USDC': 100,
      'USDT': 100,
      'SOL': 1,
      'BNB': 0.1,
      'MATIC': 10,
      'ETH/USDC': 0.05,
      'ETH/USDT': 0.05,
      'BNB/USDT': 0.1,
    };
    return minAmounts[asset] || 1;
  }

  // Get lock period for protocol
  private getLockPeriod(protocol: string): string {
    const lockPeriods: { [key: string]: string } = {
      'lido': 'No lock',
      'compound': 'No lock',
      'aave': 'No lock',
      'uniswap': 'No lock',
      'pancakeswap': 'No lock',
      'marinade': 'No lock',
    };
    return lockPeriods[protocol] || 'No lock';
  }

  // Get protocol description
  private getProtocolDescription(protocol: string): string {
    const descriptions: { [key: string]: string } = {
      'Lido': 'Liquid staking solution for ETH 2.0',
      'Compound': 'Algorithmic money market protocol',
      'Aave': 'Open source liquidity protocol',
      'Uniswap': 'Automated market maker for token swaps',
      'PancakeSwap': 'AMM and yield farming on BNB Chain',
      'Marinade': 'Liquid staking protocol for Solana',
      'Curve': 'Exchange liquidity pool designed for stablecoins',
      'Yearn': 'Yield aggregator optimizing token lending',
      'Convex': 'Platform for boosting Curve staking rewards',
      'Balancer': 'Programmable liquidity protocol',
      'Rocket Pool': 'Decentralized ETH staking protocol',
      'Stakewise': 'Liquid ETH staking with restaking rewards',
      'Binance Earn': 'Centralized staking and earning platform',
      'Benqi': 'Liquidity market protocol on Avalanche',
      'Sushi': 'DeFi platform with AMM and yield farming'
    };
    return descriptions[protocol] || 'DeFi protocol for earning yield on your assets';
  }

  // Get current APY for a protocol and asset
  async getCurrentApy(protocol: string, asset: string): Promise<number> {
    if (this.tokenApyMappings[asset] && this.tokenApyMappings[asset][protocol]) {
      const baseApy = this.tokenApyMappings[asset][protocol];
      // Add some variation to simulate real-time changes
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      return Math.max(0.1, baseApy * (1 + variation));
    }
    return 5.0; // Default APY
  }

  // Simulate staking a token
  async stakeToken(protocol: string, asset: string, amount: number, userAddress: string): Promise<StakingPosition> {
    // This would integrate with actual protocol contracts
    // For now, return a mock staking position
    
    const apy = await this.getCurrentApy(protocol, asset);
    const lockPeriod = this.getLockPeriod(protocol);
    
    return {
      id: `${protocol}-${asset}-${Date.now()}`,
      protocol,
      asset,
      amount,
      apy,
      rewards: 0, // Will accumulate over time
      lockPeriod: lockPeriod === 'No lock' ? undefined : lockPeriod,
      unlockDate: lockPeriod === 'No lock' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'active',
    };
  }

  // Get user's staking positions
  async getStakingPositions(userAddress: string): Promise<StakingPosition[]> {
    // This would fetch from a backend service or blockchain
    // For now, return mock data
    return [
      {
        id: 'lido-eth-1',
        protocol: 'lido',
        asset: 'ETH',
        amount: 2.5,
        apy: 4.2,
        rewards: 0.15,
        status: 'active',
      },
      {
        id: 'compound-usdc-1',
        protocol: 'compound',
        asset: 'USDC',
        amount: 5000,
        apy: 6.8,
        rewards: 25.5,
        status: 'active',
      },
    ];
  }

  // Calculate potential rewards
  calculatePotentialRewards(amount: number, apy: number, days: number = 365): {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  } {
    const dailyRate = apy / 365 / 100;
    const weeklyRate = apy / 52 / 100;
    const monthlyRate = apy / 12 / 100;
    const yearlyRate = apy / 100;

    return {
      daily: amount * dailyRate,
      weekly: amount * weeklyRate,
      monthly: amount * monthlyRate,
      yearly: amount * yearlyRate,
    };
  }

  // Get protocol risk assessment
  getProtocolRisk(protocol: string): {
    score: number;
    factors: {
      liquidity: number;
      security: number;
      decentralization: number;
      trackRecord: number;
    };
    description: string;
  } {
    const riskProfiles: { [key: string]: any } = {
      'lido': {
        score: 85,
        factors: { liquidity: 90, security: 85, decentralization: 80, trackRecord: 85 },
        description: 'Well-established liquid staking protocol with strong security measures',
      },
      'compound': {
        score: 80,
        factors: { liquidity: 85, security: 80, decentralization: 85, trackRecord: 90 },
        description: 'Pioneer in DeFi lending with extensive battle testing',
      },
      'aave': {
        score: 75,
        factors: { liquidity: 80, security: 75, decentralization: 80, trackRecord: 70 },
        description: 'Leading lending protocol with innovative features and strong community',
      },
      'uniswap': {
        score: 70,
        factors: { liquidity: 95, security: 70, decentralization: 90, trackRecord: 65 },
        description: 'Most liquid DEX but with impermanent loss risks for LPs',
      },
      'pancakeswap': {
        score: 65,
        factors: { liquidity: 75, security: 60, decentralization: 50, trackRecord: 60 },
        description: 'Popular BSC DEX with good yields but centralized governance',
      },
      'marinade': {
        score: 70,
        factors: { liquidity: 70, security: 75, decentralization: 65, trackRecord: 60 },
        description: 'Leading Solana staking protocol with liquid staking features',
      },
    };

    return riskProfiles[protocol] || {
      score: 50,
      factors: { liquidity: 50, security: 50, decentralization: 50, trackRecord: 50 },
      description: 'Unknown protocol - conduct thorough research before investing',
    };
  }

  // Get live DeFi opportunities from external APIs
  async getLiveDeFiOpportunities(tokens: Token[]): Promise<DeFiOpportunity[]> {
    try {
      const opportunities: DeFiOpportunity[] = [];
      
      // Get live APY data from DeFiPulse API (if available) or use alternative
      const liveData = await this.fetchLiveAPYData();
      
      // Map live data to our opportunity format
      for (const data of liveData) {
        const tokenSymbol = this.mapProtocolToToken(data.protocol);
        if (tokens.some(token => token.symbol === tokenSymbol)) {
          opportunities.push({
            id: `live-${data.protocol}-${tokenSymbol}`,
            name: data.name,
            apy: data.apy,
            asset: tokenSymbol,
            risk: this.getRiskLevel(data.protocol),
            protocol: data.protocol,
            minAmount: this.getMinAmount(tokenSymbol),
            lockPeriod: data.lockPeriod || 'No lock',
            description: data.description || `Live ${data.name} opportunity`,
            isAvailable: true,
          });
        }
      }
      
      return opportunities;
    } catch (error) {
      console.error('Error fetching live DeFi opportunities:', error);
      return [];
    }
  }

  // Fetch live APY data from external APIs
  private async fetchLiveAPYData(): Promise<any[]> {
    try {
      // Try to fetch from DeFiPulse or similar API
      // For now, return enhanced mock data with more realistic APYs
      return [
        {
          protocol: 'lido',
          name: 'Lido ETH Staking',
          apy: 4.2 + (Math.random() - 0.5) * 0.4, // 4.0-4.4%
          lockPeriod: 'No lock',
          description: 'Liquid staking for Ethereum 2.0'
        },
        {
          protocol: 'compound',
          name: 'Compound USDC',
          apy: 6.8 + (Math.random() - 0.5) * 0.6, // 6.5-7.1%
          lockPeriod: 'No lock',
          description: 'Lend USDC on Compound protocol'
        },
        {
          protocol: 'aave',
          name: 'Aave USDT',
          apy: 5.5 + (Math.random() - 0.5) * 0.5, // 5.25-5.75%
          lockPeriod: 'No lock',
          description: 'Lend USDT on Aave protocol'
        },
        {
          protocol: 'uniswap',
          name: 'Uniswap V3 ETH/USDC',
          apy: 12.3 + (Math.random() - 0.5) * 2, // 11.3-13.3%
          lockPeriod: 'No lock',
          description: 'Provide liquidity for ETH/USDC pair'
        },
        {
          protocol: 'pancakeswap',
          name: 'PancakeSwap BNB',
          apy: 8.7 + (Math.random() - 0.5) * 1, // 8.2-9.2%
          lockPeriod: 'No lock',
          description: 'Stake BNB on PancakeSwap'
        },
        {
          protocol: 'curve',
          name: 'Curve 3Pool',
          apy: 4.2 + (Math.random() - 0.5) * 0.4, // 4.0-4.4%
          lockPeriod: 'No lock',
          description: 'Stablecoin liquidity pool'
        },
        {
          protocol: 'yearn',
          name: 'Yearn USDC Vault',
          apy: 7.1 + (Math.random() - 0.5) * 0.6, // 6.8-7.4%
          lockPeriod: 'No lock',
          description: 'Automated yield farming for USDC'
        }
      ];
    } catch (error) {
      console.error('Error fetching live APY data:', error);
      return [];
    }
  }

  // Map protocol to token symbol
  private mapProtocolToToken(protocol: string): string {
    const protocolToToken: { [key: string]: string } = {
      'lido': 'ETH',
      'compound': 'USDC',
      'aave': 'USDT',
      'uniswap': 'ETH',
      'pancakeswap': 'BNB',
      'curve': 'USDC',
      'yearn': 'USDC'
    };
    return protocolToToken[protocol] || 'ETH';
  }

  // Get trending DeFi opportunities
  async getTrendingOpportunities(): Promise<DeFiOpportunity[]> {
    // This would fetch from a backend service that tracks trending protocols
    // For now, return mock trending opportunities
    return [
      {
        id: 'trending-1',
        name: 'EigenLayer',
        apy: 15.2,
        asset: 'ETH',
        risk: 'Medium',
        protocol: 'eigenlayer',
        minAmount: 0.1,
        lockPeriod: 'No lock',
        description: 'Restaking protocol for additional yield on staked ETH',
        isAvailable: true,
      },
      {
        id: 'trending-2',
        name: 'Pendle',
        apy: 18.5,
        asset: 'USDC',
        risk: 'Medium',
        protocol: 'pendle',
        minAmount: 100,
        lockPeriod: 'No lock',
        description: 'Yield trading protocol for fixed and variable yields',
        isAvailable: true,
      },
    ];
  }
}
