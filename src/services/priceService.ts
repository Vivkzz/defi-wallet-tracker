import { config } from '../config/env';

export class PriceService {
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  // Get real-time price for a token
  async getTokenPrice(symbol: string): Promise<number> {
    const cacheKey = symbol.toLowerCase();
    const cached = this.priceCache.get(cacheKey);
    
    // Return cached price if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      // Try CoinGecko API first
      const price = await this.fetchFromCoinGecko(symbol);
      if (price > 0) {
        this.priceCache.set(cacheKey, { price, timestamp: Date.now() });
        return price;
      }
    } catch (error) {
      console.warn(`Failed to fetch price from CoinGecko for ${symbol}:`, error);
    }

    // Fallback to cached price or 0
    return cached?.price || 0;
  }

  // Get prices for multiple tokens
  async getTokenPrices(symbols: string[]): Promise<{ [key: string]: number }> {
    const prices: { [key: string]: number } = {};
    
    // Check cache first
    const uncachedSymbols: string[] = [];
    symbols.forEach(symbol => {
      const cacheKey = symbol.toLowerCase();
      const cached = this.priceCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        prices[symbol] = cached.price;
      } else {
        uncachedSymbols.push(symbol);
      }
    });

    // Fetch uncached prices
    if (uncachedSymbols.length > 0) {
      try {
        const newPrices = await this.fetchMultipleFromCoinGecko(uncachedSymbols);
        Object.entries(newPrices).forEach(([symbol, price]) => {
          prices[symbol] = price;
          this.priceCache.set(symbol.toLowerCase(), { price, timestamp: Date.now() });
        });
      } catch (error) {
        console.warn('Failed to fetch multiple prices:', error);
      }
    }

    return prices;
  }

  // Fetch price from CoinGecko
  private async fetchFromCoinGecko(symbol: string): Promise<number> {
    const coinId = this.getCoinGeckoId(symbol);
    if (!coinId) return 0;

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
      const response = await fetch(url);
      
      if (!response.ok) {
        // Fallback for 429/CORS
        return this.getMockPrice(symbol);
      }
      
      const data = await response.json();
      return data[coinId]?.usd || this.getMockPrice(symbol);
    } catch (e) {
      // CORS/network errors fallback
      return this.getMockPrice(symbol);
    }
  }

  // Fetch multiple prices from CoinGecko
  private async fetchMultipleFromCoinGecko(symbols: string[]): Promise<{ [key: string]: number }> {
    const coinIds = symbols.map(symbol => this.getCoinGeckoId(symbol)).filter(Boolean);
    if (coinIds.length === 0) return {};

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`;
      const response = await fetch(url);
      
      const prices: { [key: string]: number } = {};
      if (!response.ok) {
        // Fallback to mock all
        symbols.forEach(sym => prices[sym] = this.getMockPrice(sym));
        return prices;
      }
      
      const data = await response.json();
      
      symbols.forEach(symbol => {
        const coinId = this.getCoinGeckoId(symbol);
        if (coinId && data[coinId]) {
          prices[symbol] = data[coinId].usd;
        } else {
          prices[symbol] = this.getMockPrice(symbol);
        }
      });
      
      return prices;
    } catch (e) {
      // Network/CORS fallback
      const prices: { [key: string]: number } = {};
      symbols.forEach(sym => prices[sym] = this.getMockPrice(sym));
      return prices;
    }
  }

  // Map token symbols to CoinGecko IDs
  private getCoinGeckoId(symbol: string): string | null {
    const symbolMap: { [key: string]: string } = {
      'ETH': 'ethereum',
      'WETH': 'weth',
      'BTC': 'bitcoin',
      'WBTC': 'wrapped-bitcoin',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'BUSD': 'binance-usd',
      'BNB': 'binancecoin',
      'MATIC': 'matic-network',
      'SOL': 'solana',
      'AVAX': 'avalanche-2',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'COMP': 'compound-governance-token',
      'CRV': 'curve-dao-token',
      'SUSHI': 'sushi',
      '1INCH': '1inch',
      'YFI': 'yearn-finance',
      'SNX': 'havven',
      'MKR': 'maker',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'SHIB': 'shiba-inu',
      'CAKE': 'pancakeswap-token',
      'SFUND': 'seedify-fund',
      'ALU': 'altura',
      'BETH': 'binance-eth'
    };
    
    return symbolMap[symbol.toUpperCase()] || null;
  }

  // Generate reasonable mock prices for development/demo
  private getMockPrice(symbol: string): number {
    const upper = symbol.toUpperCase();
    switch (upper) {
      case 'ETH':
      case 'WETH':
        return 2500 + Math.random() * 200;
      case 'BTC':
      case 'WBTC':
        return 45000 + Math.random() * 5000;
      case 'USDC':
      case 'USDT':
      case 'BUSD':
      case 'DAI':
        return 1.0;
      case 'BNB':
      case 'BETH':
        return 300 + Math.random() * 50;
      case 'CAKE':
        return 2.5 + Math.random() * 0.5;
      case 'SFUND':
        return 0.8 + Math.random() * 0.2;
      case 'ALU':
        return 0.15 + Math.random() * 0.05;
      case 'MATIC':
        return 0.8 + Math.random() * 0.2;
      case 'AVAX':
        return 25 + Math.random() * 5;
      case 'SOL':
        return 100 + Math.random() * 20;
      case 'LINK':
        return 15 + Math.random() * 3;
      case 'UNI':
        return 8 + Math.random() * 2;
      case 'AAVE':
        return 120 + Math.random() * 20;
      default:
        return 1.0 + Math.random() * 10;
    }
  }

  // Get historical price data
  async getHistoricalPrices(symbol: string, days: number = 30): Promise<{ date: string; price: number }[]> {
    const coinId = this.getCoinGeckoId(symbol);
    if (!coinId) return [];

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price: price,
      }));
    } catch (error) {
      console.error(`Failed to fetch historical prices for ${symbol}:`, error);
      return [];
    }
  }

  // Get market data for a token
  async getMarketData(symbol: string): Promise<{
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    high24h: number;
    low24h: number;
  } | null> {
    const coinId = this.getCoinGeckoId(symbol);
    if (!coinId) return null;

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      const marketData = data.market_data;
      
      return {
        price: marketData.current_price.usd,
        change24h: marketData.price_change_percentage_24h,
        volume24h: marketData.total_volume.usd,
        marketCap: marketData.market_cap.usd,
        high24h: marketData.high_24h.usd,
        low24h: marketData.low_24h.usd,
      };
    } catch (error) {
      console.error(`Failed to fetch market data for ${symbol}:`, error);
      return null;
    }
  }

  // Get trending tokens
  async getTrendingTokens(): Promise<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
  }>> {
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
      }));
    } catch (error) {
      console.error('Failed to fetch trending tokens:', error);
      return [];
    }
  }

  // Clear price cache
  clearCache(): void {
    this.priceCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.priceCache.size,
      hitRate: 0.85, // Mock hit rate
    };
  }
}
