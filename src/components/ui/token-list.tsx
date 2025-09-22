import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Progress } from "./progress";

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
  riskScore: number;
  chain: string;
  logo?: string;
}

interface TokenListProps {
  tokens: Token[];
  className?: string;
}

export function TokenList({ tokens, className }: TokenListProps) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className={cn("glass-card rounded-xl", className)}>
      <div className="p-6 border-b border-border-soft">
        <h3 className="text-lg font-semibold">Token Holdings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your crypto portfolio breakdown
        </p>
      </div>

      <div className="divide-y divide-border-soft">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="p-6 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{token.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {token.chain}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {token.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ${(token.value || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {token.balance.toFixed(4)} {token.symbol}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                <p
                  className={cn(
                    "font-semibold",
                    token.change24h >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {token.change24h >= 0 ? "+" : ""}
                  {token.change24h.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="font-semibold">
                  ${(token.price || 0).toFixed(6)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded",
                      token.riskScore >= 80
                        ? "bg-success/20 text-success"
                        : token.riskScore >= 60
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                    )}
                  >
                    {getRiskLabel(token.riskScore)}
                  </span>
                </div>
                <Progress
                  value={token.riskScore}
                  className={cn("h-2", getRiskColor(token.riskScore))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
