import { Wallet, Transaction } from '../types/portfolio';
import { PortfolioService } from './portfolioService';

export class WalletService {
  private portfolioService: PortfolioService;
  private wallets: Wallet[] = [];
  private currentWallet: Wallet | null = null;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.loadWalletsFromStorage();
  }

  // Connect a new wallet
  async connectWallet(
    address: string, 
    type: Wallet['type'], 
    name?: string
  ): Promise<Wallet> {
    // Check if wallet already exists
    let wallet = this.wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
    
    if (wallet) {
      wallet.isConnected = true;
      wallet.lastUsed = new Date().toISOString();
    } else {
      wallet = {
        id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        address,
        name: name || `${type} Wallet`,
        type,
        isConnected: true,
        lastUsed: new Date().toISOString(),
      };
      
      this.wallets.push(wallet);
    }

    this.currentWallet = wallet;
    this.saveWalletsToStorage();
    
    return wallet;
  }

  // Disconnect a wallet
  disconnectWallet(walletId: string): void {
    const wallet = this.wallets.find(w => w.id === walletId);
    if (wallet) {
      wallet.isConnected = false;
      if (this.currentWallet?.id === walletId) {
        this.currentWallet = null;
      }
      this.saveWalletsToStorage();
    }
  }

  // Disconnect all wallets
  disconnectAllWallets(): void {
    this.wallets.forEach(wallet => {
      wallet.isConnected = false;
    });
    this.currentWallet = null;
    this.saveWalletsToStorage();
  }

  // Get all wallets
  getWallets(): Wallet[] {
    return [...this.wallets];
  }

  // Get connected wallets
  getConnectedWallets(): Wallet[] {
    return this.wallets.filter(wallet => wallet.isConnected);
  }

  // Get current wallet
  getCurrentWallet(): Wallet | null {
    return this.currentWallet;
  }

  // Set current wallet
  setCurrentWallet(walletId: string): boolean {
    const wallet = this.wallets.find(w => w.id === walletId);
    if (wallet && wallet.isConnected) {
      this.currentWallet = wallet;
      wallet.lastUsed = new Date().toISOString();
      this.saveWalletsToStorage();
      return true;
    }
    return false;
  }

  // Update wallet name
  updateWalletName(walletId: string, name: string): boolean {
    const wallet = this.wallets.find(w => w.id === walletId);
    if (wallet) {
      wallet.name = name;
      this.saveWalletsToStorage();
      return true;
    }
    return false;
  }

  // Remove a wallet
  removeWallet(walletId: string): boolean {
    const index = this.wallets.findIndex(w => w.id === walletId);
    if (index > -1) {
      this.wallets.splice(index, 1);
      if (this.currentWallet?.id === walletId) {
        this.currentWallet = null;
      }
      this.saveWalletsToStorage();
      return true;
    }
    return false;
  }

  // Get wallet portfolio
  async getWalletPortfolio(walletId: string): Promise<any> {
    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return await this.portfolioService.getAggregatedPortfolio(wallet.address);
  }

  // Get wallet transactions
  async getWalletTransactions(walletId: string, limit: number = 50): Promise<Transaction[]> {
    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // This would typically fetch from a blockchain API or backend service
    // For now, return mock data
    return this.generateMockTransactions(wallet.address, limit);
  }

  // Generate mock transactions
  private generateMockTransactions(address: string, limit: number): Transaction[] {
    const transactions: Transaction[] = [];
    const types: Transaction['type'][] = ['send', 'receive', 'swap', 'stake', 'unstake'];
    const assets = ['ETH', 'USDC', 'USDT', 'BTC', 'SOL'];
    const statuses: Transaction['status'][] = ['confirmed', 'pending', 'failed'];

    for (let i = 0; i < limit; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const amount = Math.random() * 1000;
      const value = amount * (Math.random() * 100 + 1); // Random price
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      transactions.push({
        id: `tx-${Date.now()}-${i}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type,
        from: type === 'receive' ? `0x${Math.random().toString(16).substr(2, 40)}` : address,
        to: type === 'send' ? `0x${Math.random().toString(16).substr(2, 40)}` : address,
        amount,
        asset,
        value,
        timestamp: timestamp.toISOString(),
        status,
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        gasPrice: Math.random() * 50 + 10,
      });
    }

    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get wallet balance summary
  async getWalletBalanceSummary(walletId: string): Promise<{
    totalValue: number;
    change24h: number;
    change24hPercent: number;
    tokenCount: number;
    chainCount: number;
  }> {
    const portfolio = await this.getWalletPortfolio(walletId);
    
    return {
      totalValue: portfolio.totalValue,
      change24h: portfolio.change24h,
      change24hPercent: portfolio.change24hPercent,
      tokenCount: portfolio.tokens.length,
      chainCount: new Set(portfolio.tokens.map(t => t.chainId)).size,
    };
  }

  // Validate wallet address
  validateAddress(address: string, type: Wallet['type']): boolean {
    switch (type) {
      case 'metamask':
      case 'walletconnect':
      case 'coinbase':
        // Ethereum address validation
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'phantom':
        // Solana address validation
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        return false;
    }
  }

  // Get wallet type from address
  detectWalletType(address: string): Wallet['type'] | null {
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return 'metamask'; // Default to metamask for Ethereum addresses
    } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return 'phantom'; // Solana address
    }
    return null;
  }

  // Import wallet from private key (for testing purposes only)
  async importWalletFromPrivateKey(privateKey: string, name: string): Promise<Wallet> {
    // This is a simplified implementation for demo purposes
    // In production, this should be handled securely
    const address = `0x${Math.random().toString(16).substr(2, 40)}`; // Mock address generation
    
    return await this.connectWallet(address, 'metamask', name);
  }

  // Export wallet data
  exportWalletData(): string {
    const exportData = {
      wallets: this.wallets.map(wallet => ({
        id: wallet.id,
        address: wallet.address,
        name: wallet.name,
        type: wallet.type,
        lastUsed: wallet.lastUsed,
        // Don't export connection status for security
      })),
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import wallet data
  importWalletData(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      
      if (importData.wallets && Array.isArray(importData.wallets)) {
        // Merge with existing wallets, avoiding duplicates
        importData.wallets.forEach((importedWallet: any) => {
          const exists = this.wallets.some(w => w.address.toLowerCase() === importedWallet.address.toLowerCase());
          if (!exists) {
            this.wallets.push({
              ...importedWallet,
              isConnected: false, // Always start as disconnected
            });
          }
        });
        
        this.saveWalletsToStorage();
        return true;
      }
    } catch (error) {
      console.error('Failed to import wallet data:', error);
    }
    
    return false;
  }

  // Save wallets to localStorage
  private saveWalletsToStorage(): void {
    try {
      const data = this.wallets.map(wallet => ({
        ...wallet,
        isConnected: false, // Don't persist connection status
      }));
      localStorage.setItem('omni-folio-wallets', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save wallets to storage:', error);
    }
  }

  // Load wallets from localStorage
  private loadWalletsFromStorage(): void {
    try {
      const data = localStorage.getItem('omni-folio-wallets');
      if (data) {
        this.wallets = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load wallets from storage:', error);
      this.wallets = [];
    }
  }

  // Clear all wallet data
  clearAllData(): void {
    this.wallets = [];
    this.currentWallet = null;
    localStorage.removeItem('omni-folio-wallets');
  }

  // Get wallet statistics
  getWalletStatistics(): {
    totalWallets: number;
    connectedWallets: number;
    totalValue: number;
    mostUsedWallet: Wallet | null;
  } {
    const connectedWallets = this.getConnectedWallets();
    const mostUsedWallet = this.wallets.reduce((most, current) => 
      new Date(current.lastUsed) > new Date(most.lastUsed) ? current : most, 
      this.wallets[0] || null
    );

    return {
      totalWallets: this.wallets.length,
      connectedWallets: connectedWallets.length,
      totalValue: 0, // This would be calculated from portfolio data
      mostUsedWallet,
    };
  }
}
