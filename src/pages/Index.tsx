import { Navigation } from "@/components/ui/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { TokenList } from "@/components/ui/token-list";
import { ChartCard, MockChart } from "@/components/ui/chart-card";
import { PortfolioChart } from "@/components/ui/portfolio-chart";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Shield,
  DollarSign,
  Activity,
  Plus,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Settings,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { usePortfolio } from "../hooks/usePortfolio";

const Index = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Use portfolio hook
  const {
    portfolio,
    analytics,
    defiOpportunities,
    alerts,
    chartData,
    isLoading,
    error,
    lastUpdated,
    refreshPortfolio,
    clearError,
    markAlertAsRead,
    markAllAlertsAsRead,
    settings,
    updateSettings,
  } = usePortfolio();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="md:ml-64 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Overview</h1>
            <p className="text-muted-foreground mt-1">
              {isConnected
                ? `Welcome, ${address}`
                : "Track your DeFi investments across multiple chains"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={refreshPortfolio}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>

            {/* Settings Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hide &lt;$5</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateSettings({
                    privacy: {
                      ...settings.privacy,
                      hideSmallBalances: !settings.privacy.hideSmallBalances,
                    },
                  })
                }
                className={`h-6 w-11 rounded-full p-0 ${
                  settings.privacy.hideSmallBalances ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-background transition-transform ${
                    settings.privacy.hideSmallBalances
                      ? "translate-x-3"
                      : "translate-x-0.5"
                  }`}
                />
              </Button>
            </div>

            {isConnected ? (
              <Button variant="accent" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            ) : (
              connectors.map((connector) => (
                <Button
                  variant="accent"
                  size="sm"
                  key={connector.id}
                  onClick={() => connect({ connector })}
                >
                  <Plus className="h-4 w-4" />
                  Connect {connector.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card rounded-xl p-4 border-l-4 border-destructive">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">
                    Error Loading Portfolio
                  </h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Portfolio Alerts</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {alerts?.filter((a) => !a.isRead)?.length || 0} unread
                </span>
                <Button variant="ghost" size="sm" onClick={markAllAlertsAsRead}>
                  Mark All Read
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {alerts?.slice(0, 5)?.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === "high"
                      ? "border-destructive bg-destructive/5"
                      : alert.severity === "medium"
                      ? "border-warning bg-warning/5"
                      : "border-success bg-success/5"
                  } ${alert.isRead ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Portfolio Value"
            value={
              portfolio
                ? `$${
                    portfolio.totalValue?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    }) || 0
                  }`
                : "$0.00"
            }
            change={
              analytics
                ? `${analytics.change24hPercent?.toFixed(2) || 0}%`
                : "0.00%"
            }
            changeType={
              analytics && analytics.change24h >= 0 ? "positive" : "negative"
            }
            icon={DollarSign}
          />
          <StatCard
            title="24h Change"
            value={
              analytics
                ? `$${
                    analytics.change24h?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    }) || 0
                  }`
                : "$0.00"
            }
            change={
              analytics
                ? `${analytics.change24hPercent?.toFixed(2) || 0}%`
                : "0.00%"
            }
            changeType={
              analytics && analytics.change24h >= 0 ? "positive" : "negative"
            }
            icon={
              analytics && analytics.change24h >= 0 ? TrendingUp : TrendingDown
            }
          />
          <StatCard
            title="Active Positions"
            value={
              portfolio ? portfolio.tokens?.length?.toString() || "0" : "0"
            }
            change={
              portfolio ? `${portfolio.tokens?.length || 0} assets` : "0 assets"
            }
            changeType="neutral"
            icon={Wallet}
          />
          <StatCard
            title="Risk Score"
            value={
              analytics
                ? (analytics.riskScore || 0) >= 80
                  ? "Low"
                  : (analytics.riskScore || 0) >= 60
                  ? "Medium"
                  : "High"
                : "Unknown"
            }
            change={analytics ? `${analytics.riskScore || 0}/100` : "0/100"}
            changeType={
              analytics && (analytics.riskScore || 0) >= 80
                ? "positive"
                : analytics && (analytics.riskScore || 0) >= 60
                ? "neutral"
                : "negative"
            }
            icon={Shield}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {chartData.performance.length > 0 ? (
            <PortfolioChart
              data={chartData.performance}
              title="Portfolio Performance"
              description="30-day value history across all chains"
              type="line"
            />
          ) : (
            <ChartCard
              title="Portfolio Performance"
              description="30-day value history across all chains"
            >
              <MockChart type="line" />
            </ChartCard>
          )}

          {chartData.assetAllocation.length > 0 ? (
            <PortfolioChart
              data={[]}
              title="Asset Allocation"
              description="Distribution by token value"
              type="pie"
              pieData={chartData.assetAllocation}
            />
          ) : (
            <ChartCard
              title="Asset Allocation"
              description="Distribution by token value"
            >
              <MockChart type="area" />
            </ChartCard>
          )}

          {chartData.riskDistribution.length > 0 ? (
            <PortfolioChart
              data={[]}
              title="Risk Distribution"
              description="Portfolio risk level breakdown"
              type="pie"
              pieData={chartData.riskDistribution}
            />
          ) : (
            <ChartCard
              title="Risk Distribution"
              description="Portfolio risk level breakdown"
            >
              <MockChart type="area" />
            </ChartCard>
          )}
        </div>

        {/* Token Holdings */}
        {portfolio && portfolio.tokens && portfolio.tokens.length > 0 ? (
          <div>
            {settings.privacy.hideSmallBalances && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border-soft">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Filter Active:</span> Hiding
                  tokens with value below $5 to reduce spam tokens.
                </p>
              </div>
            )}
            <TokenList tokens={portfolio.tokens} />
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6">
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tokens found</h3>
              <p className="text-muted-foreground">
                {isConnected
                  ? "This wallet doesn't have any token holdings above the minimum threshold."
                  : "Connect your wallet to view your portfolio."}
              </p>
            </div>
          </div>
        )}

        {/* DeFi Opportunities */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">DeFi Opportunities</h3>
              <p className="text-sm text-muted-foreground">
                Recommended staking and yield farming opportunities based on
                your holdings
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/defi">View All</a>
            </Button>
          </div>

          {defiOpportunities && defiOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defiOpportunities?.slice(0, 6)?.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="glass-subtle rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{opportunity.name}</h4>
                    <span className="text-lg font-bold text-success">
                      {opportunity.apy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Asset:</span>
                      <span>{opportunity.asset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform:</span>
                      <span>{opportunity.protocol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Risk:</span>
                      <span
                        className={
                          opportunity.risk === "Low"
                            ? "text-success"
                            : opportunity.risk === "Medium"
                            ? "text-warning"
                            : "text-destructive"
                        }
                      >
                        {opportunity.risk}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Amount:</span>
                      <span>
                        {opportunity.minAmount} {opportunity.asset}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Stake Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No opportunities found
              </h3>
              <p className="text-muted-foreground">
                {isConnected
                  ? "No DeFi opportunities available for your current holdings."
                  : "Connect your wallet to see personalized DeFi opportunities."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
