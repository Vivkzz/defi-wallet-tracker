import React, { useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  ArrowUpDown,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  ExternalLink,
} from "lucide-react";
import { DeFiOpportunity, StakingPosition } from "@/types/portfolio";
import { DeFiService } from "@/services/defiService";

export default function Defi() {
  const { defiOpportunities, isLoading, error, portfolio } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"apy" | "risk" | "asset">("apy");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(
    []
  );
  const [showStakingDialog, setShowStakingDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<DeFiOpportunity | null>(null);
  const [stakingAmount, setStakingAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);

  const defiService = new DeFiService();

  // Filter and sort opportunities
  const filteredOpportunities =
    defiOpportunities
      ?.filter((opportunity) => {
        // Apply search filter
        const matchesSearch =
          opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opportunity.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opportunity.protocol.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply risk filter
        const matchesRisk =
          riskFilter === "all" ||
          opportunity.risk.toLowerCase() === riskFilter.toLowerCase();

        return matchesSearch && matchesRisk;
      })
      ?.sort((a, b) => {
        // Apply sorting
        if (sortBy === "apy") {
          return sortOrder === "desc" ? b.apy - a.apy : a.apy - b.apy;
        } else if (sortBy === "risk") {
          const riskOrder = { Low: 1, Medium: 2, High: 3 };
          const riskA = riskOrder[a.risk as keyof typeof riskOrder];
          const riskB = riskOrder[b.risk as keyof typeof riskOrder];
          return sortOrder === "desc" ? riskB - riskA : riskA - riskB;
        } else if (sortBy === "asset") {
          return sortOrder === "desc"
            ? b.asset.localeCompare(a.asset)
            : a.asset.localeCompare(b.asset);
        }
        return 0;
      }) || [];

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Handle staking
  const handleStake = async (opportunity: DeFiOpportunity) => {
    setSelectedOpportunity(opportunity);
    setStakingAmount("");
    setShowStakingDialog(true);
  };

  const handleConfirmStake = async () => {
    if (!selectedOpportunity || !stakingAmount || !portfolio) return;

    setIsStaking(true);
    try {
      const amount = parseFloat(stakingAmount);
      const stakingPosition = await defiService.stakeToken(
        selectedOpportunity.protocol,
        selectedOpportunity.asset,
        amount,
        portfolio.address
      );

      setStakingPositions((prev) => [...prev, stakingPosition]);
      setShowStakingDialog(false);
      setSelectedOpportunity(null);
      setStakingAmount("");
    } catch (error) {
      console.error("Error staking:", error);
    } finally {
      setIsStaking(false);
    }
  };

  // Get user's token balance for the selected opportunity
  const getUserBalance = (asset: string) => {
    if (!portfolio) return 0;
    const token = portfolio.tokens.find((t) => t.symbol === asset);
    return token ? token.balance : 0;
  };

  // Calculate potential rewards
  const calculatePotentialRewards = (amount: number, apy: number) => {
    return defiService.calculatePotentialRewards(amount, apy);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="min-h-screen bg-background md:ml-64">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-2">DeFi Opportunities</h1>
          <p className="text-muted-foreground mb-8">
            Explore yield farming and staking opportunities for your portfolio
            assets
          </p>

          {error ? (
            <div className="p-4 mb-6 border border-destructive/50 bg-destructive/10 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          ) : null}

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by token, platform or name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={toggleSortOrder}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "desc" ? "Highest First" : "Lowest First"}
              </Button>
            </div>
          </div>

          {/* Tabs for sorting */}
          <Tabs
            defaultValue="apy"
            className="mb-6"
            onValueChange={(value) =>
              setSortBy(value as "apy" | "risk" | "asset")
            }
          >
            <TabsList>
              <TabsTrigger value="apy">Sort by APY</TabsTrigger>
              <TabsTrigger value="risk">Sort by Risk</TabsTrigger>
              <TabsTrigger value="asset">Sort by Asset</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading DeFi opportunities...
              </p>
            </div>
          ) : filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onStake={handleStake}
                  userBalance={getUserBalance(opportunity.asset)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <h3 className="text-lg font-semibold mb-2">
                No opportunities found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || riskFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "We couldn't find any DeFi opportunities for your current holdings."}
              </p>
            </div>
          )}

          {/* Staking Dialog */}
          <Dialog open={showStakingDialog} onOpenChange={setShowStakingDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Stake {selectedOpportunity?.asset}</DialogTitle>
                <DialogDescription>
                  Stake your {selectedOpportunity?.asset} tokens on{" "}
                  {selectedOpportunity?.protocol} to earn{" "}
                  {selectedOpportunity?.apy.toFixed(2)}% APY
                </DialogDescription>
              </DialogHeader>

              {selectedOpportunity && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Protocol:</span>
                      <span>{selectedOpportunity.protocol}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">APY:</span>
                      <span className="text-success font-bold">
                        {selectedOpportunity.apy.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Lock Period:</span>
                      <span>{selectedOpportunity.lockPeriod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Your Balance:</span>
                      <span>
                        {getUserBalance(selectedOpportunity.asset).toFixed(4)}{" "}
                        {selectedOpportunity.asset}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Stake</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Min: ${selectedOpportunity.minAmount} ${selectedOpportunity.asset}`}
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                      min={selectedOpportunity.minAmount}
                      max={getUserBalance(selectedOpportunity.asset)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum: {selectedOpportunity.minAmount}{" "}
                      {selectedOpportunity.asset}
                    </p>
                  </div>

                  {stakingAmount && parseFloat(stakingAmount) > 0 && (
                    <div className="p-4 rounded-lg bg-success/10">
                      <div className="text-sm font-medium mb-2">
                        Potential Rewards
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Daily:</span>
                          <span className="text-success">
                            $
                            {calculatePotentialRewards(
                              parseFloat(stakingAmount),
                              selectedOpportunity.apy
                            ).daily.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span className="text-success">
                            $
                            {calculatePotentialRewards(
                              parseFloat(stakingAmount),
                              selectedOpportunity.apy
                            ).monthly.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Yearly:</span>
                          <span className="text-success">
                            $
                            {calculatePotentialRewards(
                              parseFloat(stakingAmount),
                              selectedOpportunity.apy
                            ).yearly.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowStakingDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmStake}
                  disabled={
                    !stakingAmount ||
                    parseFloat(stakingAmount) <
                      (selectedOpportunity?.minAmount || 0) ||
                    isStaking
                  }
                >
                  {isStaking ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Staking...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Stake Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: DeFiOpportunity;
  onStake: (opportunity: DeFiOpportunity) => void;
  userBalance: number;
}

function OpportunityCard({
  opportunity,
  onStake,
  userBalance,
}: OpportunityCardProps) {
  const canStake = userBalance >= opportunity.minAmount;
  const defiService = new DeFiService();
  const potentialRewards = defiService.calculatePotentialRewards(
    opportunity.minAmount,
    opportunity.apy
  );

  return (
    <div className="glass-card rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{opportunity.name}</h3>
        <Badge
          variant={
            opportunity.risk === "Low"
              ? "outline"
              : opportunity.risk === "Medium"
              ? "secondary"
              : "destructive"
          }
        >
          {opportunity.risk} Risk
        </Badge>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-success mb-1">
          {opportunity.apy.toFixed(2)}% APY
        </div>
        <p className="text-sm text-muted-foreground">{opportunity.protocol}</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Asset:</span>
          <span className="font-medium">{opportunity.asset}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Your Balance:</span>
          <span className="font-medium">
            {userBalance.toFixed(4)} {opportunity.asset}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Amount:</span>
          <span className="font-medium">
            {opportunity.minAmount} {opportunity.asset}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lock Period:</span>
          <span className="font-medium">{opportunity.lockPeriod}</span>
        </div>
      </div>

      {/* Potential Rewards Preview */}
      <div className="mb-4 p-3 rounded-lg bg-muted/20">
        <div className="text-sm font-medium mb-2">
          Potential Rewards (Min Amount)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Daily:</span>
            <span className="text-success">
              ${potentialRewards.daily.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monthly:</span>
            <span className="text-success">
              ${potentialRewards.monthly.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-6">{opportunity.description}</p>

      <div className="flex gap-2">
        <Button
          className="w-full"
          onClick={() => onStake(opportunity)}
          disabled={!canStake}
        >
          <Zap className="h-4 w-4 mr-2" />
          {canStake ? "Stake Now" : "Insufficient Balance"}
        </Button>
        <Button variant="outline" className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          Learn More
        </Button>
      </div>
    </div>
  );
}
