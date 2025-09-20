import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "@/hooks/useSecurity";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wallet,
  ExternalLink,
  Lock,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const Security = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    approvals,
    securityChecks,
    securityScore,
    recommendations,
    loading,
    error,
    revokeApproval,
    refreshSecurityData,
  } = useSecurity();

  const [revoking, setRevoking] = useState<string | null>(null);

  // Handle revoke approval
  const handleRevokeApproval = async (approvalId: string) => {
    setRevoking(approvalId);
    try {
      await revokeApproval(approvalId);
    } finally {
      setRevoking(null);
    }
  };

  // Get security score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  // Get security score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh">
      <Navigation />

      <main className="flex-1 p-6 md:p-10 md:ml-64 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wallet Security</h1>
            <p className="text-muted-foreground mt-1">
              Protect your assets and manage contract approvals
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshSecurityData()}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={() => connect({ connector: connectors[0] })}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-xl p-4 border-l-4 border-destructive">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">
                    Error Loading Security Data
                  </h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isConnected ? (
          <div className="glass-card rounded-xl p-6">
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Connect your wallet to view security information and manage contract approvals.
              </p>
              <Button onClick={() => connect({ connector: connectors[0] })}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Security Score */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Security Score</h2>
                  <p className="text-muted-foreground mb-4">
                    Your wallet security score based on various security checks
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Security</span>
                      <span className={getScoreColor(securityScore)}>
                        {getScoreLabel(securityScore)} ({securityScore}/100)
                      </span>
                    </div>
                    <Progress
                      value={securityScore}
                      className={`h-2 ${securityScore >= 80 ? 'bg-success/20' : securityScore >= 60 ? 'bg-warning/20' : 'bg-destructive/20'}`}
                    />
                  </div>
                </div>
                <div className="md:w-64 flex flex-col items-center justify-center p-6 glass-subtle rounded-xl">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                        r="58"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={`${securityScore >= 80 ? 'text-success' : securityScore >= 60 ? 'text-warning' : 'text-destructive'} stroke-current`}
                        strokeWidth="6"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="58"
                        cx="64"
                        cy="64"
                        strokeDasharray="364.4"
                        strokeDashoffset={364.4 - (364.4 * securityScore) / 100}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
                        {securityScore}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Security Score
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Recommendations */}
            {recommendations.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-2">Security Recommendations</h2>
                <p className="text-muted-foreground mb-4">
                  Actionable steps to improve your wallet security
                </p>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border-l-4 border-warning bg-warning/5"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <p>{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contract Approvals */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Contract Approvals</h2>
              <p className="text-muted-foreground mb-4">
                Manage token approvals granted to smart contracts
              </p>

              {approvals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-soft">
                        <th className="text-left py-3 px-4 font-medium">Token</th>
                        <th className="text-left py-3 px-4 font-medium">Spender</th>
                        <th className="text-left py-3 px-4 font-medium">Allowance</th>
                        <th className="text-left py-3 px-4 font-medium">Risk</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {approvals.map((approval) => (
                        <tr key={approval.id} className="hover:bg-muted/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-foreground">
                                  {approval.tokenSymbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{approval.tokenName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {approval.tokenSymbol}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{approval.spenderName}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {approval.spenderAddress}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {approval.unlimited ? (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                Unlimited
                              </Badge>
                            ) : (
                              <span>{approval.allowance}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`${approval.riskLevel === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                approval.riskLevel === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                                'bg-success/10 text-success border-success/20'}`}
                            >
                              {approval.riskLevel.charAt(0).toUpperCase() + approval.riskLevel.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeApproval(approval.id)}
                              disabled={revoking === approval.id}
                            >
                              {revoking === approval.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Revoke
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <h3 className="text-lg font-semibold mb-2">No Approvals Found</h3>
                  <p className="text-muted-foreground">
                    Your wallet doesn't have any active contract approvals.
                  </p>
                </div>
              )}
            </div>

            {/* Security Checks */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Security Checks</h2>
              <p className="text-muted-foreground mb-4">
                Detailed security checks for your wallet
              </p>

              <div className="space-y-4">
                {securityChecks.map((check) => (
                  <div
                    key={check.id}
                    className={`p-4 rounded-lg ${check.status === 'passed' ? 'bg-success/5' : 
                      check.status === 'warning' ? 'bg-warning/5' : 
                      check.status === 'failed' ? 'bg-destructive/5' : 'bg-muted/20'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{check.name}</h4>
                          {getSeverityBadge(check.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {check.description}
                        </p>
                        {check.status !== 'passed' && (
                          <p className="text-sm font-medium">
                            {check.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Tips */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Security Best Practices</h2>
              <p className="text-muted-foreground mb-4">
                General tips to keep your crypto assets secure
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Use a Hardware Wallet</h4>
                      <p className="text-sm text-muted-foreground">
                        Hardware wallets provide the highest level of security by keeping your private keys offline.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Revoke Unused Approvals</h4>
                      <p className="text-sm text-muted-foreground">
                        Regularly review and revoke token approvals that you no longer need to minimize risk.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Enable Multi-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Use MFA wherever possible, including exchanges and web3 services.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Verify Contract Addresses</h4>
                      <p className="text-sm text-muted-foreground">
                        Always double-check contract addresses before interacting with them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Security;