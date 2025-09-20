# Omni Folio Guard - Next-Gen DeFi Portfolio Tracker

A comprehensive DeFi portfolio tracking and management platform that allows users to track their entire crypto portfolio across multiple chains, analyze token risks, discover DeFi opportunities, and manage their investments with advanced analytics.

## 🚀 Features

### Core Portfolio Management

- **Multi-Chain Support**: Track portfolios across Ethereum, Polygon, BSC, Avalanche, and Solana
- **Real-Time Valuation**: Live price updates and portfolio value tracking
- **Token Analysis**: Comprehensive token information including balances, prices, and 24h changes
- **NFT Tracking**: Monitor NFT collections and their floor prices

### Risk Analysis & Security

- **Token Risk Scoring**: AI-powered risk assessment for each token
- **Portfolio Risk Analysis**: Overall portfolio risk evaluation and recommendations
- **Concentration Alerts**: Warnings for over-concentration in specific assets
- **Security Insights**: Contract verification and authenticity checks

### DeFi Opportunities

- **Personalized Recommendations**: DeFi opportunities based on your holdings
- **Yield Farming**: Discover staking and liquidity farming opportunities
- **APY Tracking**: Real-time yield rates and performance metrics
- **Protocol Analysis**: Risk assessment for DeFi protocols

### Advanced Analytics

- **Performance Charts**: Real-time 30-day portfolio performance visualization
- **Asset Allocation**: Interactive pie chart showing portfolio distribution by token value
- **Risk Distribution**: Risk level breakdown across holdings with color-coded categories
- **Smart Filtering**: Hide low-value tokens (below $5) to reduce spam token clutter

### Smart Notifications

- **Price Alerts**: Customizable price change notifications
- **Risk Alerts**: Portfolio risk warnings and recommendations
- **Opportunity Alerts**: New DeFi opportunities notifications
- **Portfolio Changes**: Transaction and balance change alerts

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI, Shadcn/ui
- **Web3 Integration**: Wagmi, Ethers.js
- **State Management**: React Query, Custom Hooks
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/omni-folio-guard.git
   cd omni-folio-guard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```env
   # API Keys (Required)
   VITE_COVALENT_API_KEY=your_covalent_api_key_here
   VITE_ETHERSCAN_API_KEY=your_etherscan_api_key_here
   VITE_COINGECKO_API_KEY=your_coingecko_api_key_here

   # Optional API Keys
   VITE_MORALIS_API_KEY=your_moralis_api_key_here
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here

   # Configuration
   VITE_SUPPORTED_CHAINS=eth-mainnet,polygon-mainnet,bsc-mainnet,avalanche-mainnet,solana-mainnet
   VITE_DEFAULT_CURRENCY=USD
   VITE_REFRESH_INTERVAL=30000
   ```

4. **Get API Keys**

   - **Covalent**: Sign up at [covalent.xyz](https://covalent.xyz) for blockchain data
   - **CoinGecko**: Get free API key at [coingecko.com](https://coingecko.com)
   - **Etherscan**: Register at [etherscan.io](https://etherscan.io) for Ethereum data

5. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Supported Chains

The application supports the following blockchain networks:

- **Ethereum** (eth-mainnet)
- **Polygon** (polygon-mainnet)
- **Binance Smart Chain** (bsc-mainnet)
- **Avalanche** (avalanche-mainnet)
- **Solana** (solana-mainnet)

### Customization

- **Currencies**: Support for USD, EUR, GBP, JPY, and more
- **Refresh Intervals**: Configurable from 10 seconds to 1 hour
- **Risk Thresholds**: Customizable risk scoring parameters
- **DeFi Protocols**: Add or remove supported protocols

## 📱 Usage

### Connecting Your Wallet

1. Click "Connect Wallet" button
2. Select your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet
4. Your portfolio will automatically load

### Viewing Your Portfolio

- **Overview**: Total value, 24h change, and key metrics
- **Token Holdings**: Detailed list of all your tokens
- **DeFi Opportunities**: Personalized yield farming suggestions
- **Analytics**: Performance charts and risk analysis

### Managing Alerts

- **Price Alerts**: Set custom price thresholds
- **Risk Alerts**: Monitor portfolio risk levels
- **Opportunity Alerts**: Get notified of new DeFi opportunities

## 🏗️ Architecture

### Services

- **PortfolioService**: Multi-chain portfolio data aggregation
- **RiskAnalysisService**: Token and portfolio risk assessment
- **DeFiService**: DeFi opportunity discovery and analysis
- **PriceService**: Real-time price tracking and historical data
- **NotificationService**: Alert management and notifications
- **WalletService**: Multi-wallet connection and management
- **SettingsService**: User preferences and configuration

### Hooks

- **usePortfolio**: Main portfolio state management hook
- **useWallet**: Wallet connection and management
- **useSettings**: User preferences and settings

### Types

- Comprehensive TypeScript definitions for all data structures
- Type-safe API responses and service interfaces

## 🔒 Security

### Data Privacy

- All data is processed client-side
- No private keys or sensitive data stored
- Wallet connections use standard Web3 protocols

### Risk Assessment

- Multiple risk factors analyzed
- Real-time security monitoring
- Contract verification checks

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Portfolio not loading?**

- Check your API keys are correctly set
- Ensure your wallet is connected
- Verify the wallet address has token holdings

**Missing tokens?**

- Some tokens may not be supported by the data provider
- Check if the token contract is verified
- Try refreshing the portfolio

**DeFi opportunities not showing?**

- Ensure you have sufficient token balances
- Check if the protocol is supported
- Verify minimum staking requirements

### Getting Help

- 📧 Email: support@omnifolioguard.com
- 💬 Discord: [Join our community](https://discord.gg/omnifolioguard)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/omni-folio-guard/issues)

## 🗺️ Roadmap

### Phase 1 (Current)

- ✅ Multi-chain portfolio tracking
- ✅ Risk analysis and scoring
- ✅ DeFi opportunity discovery
- ✅ Real-time price tracking

### Phase 2 (Q2 2024)

- 🔄 Mobile app development
- 🔄 Advanced charting and analytics
- 🔄 Social features and community insights
- 🔄 Automated portfolio rebalancing

### Phase 3 (Q3 2024)

- 📋 Institutional features
- 📋 Advanced risk management tools
- 📋 Cross-chain DeFi integrations
- 📋 AI-powered investment recommendations

## 🙏 Acknowledgments

- **Covalent** for blockchain data APIs
- **CoinGecko** for price data
- **Radix UI** for accessible components
- **Tailwind CSS** for styling framework
- **Vite** for build tooling

---

**Built with ❤️ for the DeFi community**
