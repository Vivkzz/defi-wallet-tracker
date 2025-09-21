import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIChat } from "@/components/ui/ai-chat";
import { useAI } from "@/hooks/useAI";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Bot,
  Brain,
  TrendingUp,
  Shield,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Settings,
  ExternalLink,
} from "lucide-react";

const AI = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    portfolio,
    defiOpportunities,
    isLoading: portfolioLoading,
  } = usePortfolio();
  const {
    messages,
    analysis,
    isConfigured,
    isLoading,
    isAnalyzing,
    error,
    sendMessage,
    analyzePortfolio,
    clearConversation,
    getRecommendations,
  } = useAI(portfolio, defiOpportunities, []);

  const [activeTab, setActiveTab] = useState("chat");
  const [recommendations, setRecommendations] = useState<{
    recommendations: string[];
    reasoning: string;
    riskLevel: "low" | "medium" | "high";
  } | null>(null);

  // Auto-analyze portfolio when it loads
  useEffect(() => {
    if (portfolio && portfolio.tokens.length > 0 && !analysis) {
      analyzePortfolio();
    }
  }, [portfolio, analysis, analyzePortfolio]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "opportunity":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-primary" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-destructive bg-destructive/5";
      case "medium":
        return "border-warning bg-warning/5";
      case "low":
        return "border-success bg-success/5";
      default:
        return "border-muted bg-muted/5";
    }
  };

  const handleGetRecommendations = async () => {
    const recs = await getRecommendations(
      "Give me personalized recommendations for my portfolio"
    );
    setRecommendations(recs);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="md:ml-64 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              AI Portfolio Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Your intelligent DeFi portfolio assistant powered by AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isConfigured && (
              <Badge variant="outline" className="text-warning">
                <Settings className="h-3 w-3 mr-1" />
                API Key Required
              </Badge>
            )}

            {isConnected ? (
              <Button variant="outline" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => connect({ connector: connectors[0] })}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* API Configuration Notice */}
        {!isConfigured && (
          <Card className="p-4 border-warning bg-warning/5">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning">
                  AI Features Require Configuration
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  To use the AI portfolio manager, please set your Gemini API
                  key in the environment variables. Add{" "}
                  <code className="bg-muted px-1 rounded">
                    VITE_GEMINI_API_KEY
                  </code>{" "}
                  to your .env file.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!isConnected ? (
          <Card className="p-8 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to access AI-powered portfolio analysis and
              recommendations.
            </p>
            <Button onClick={() => connect({ connector: connectors[0] })}>
              <Bot className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </Card>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="h-[600px] flex flex-col">
                    <AIChat
                      messages={messages}
                      isLoading={isLoading}
                      onSendMessage={sendMessage}
                      onClearConversation={clearConversation}
                      isConfigured={isConfigured}
                    />
                  </Card>
                </div>

                <div className="space-y-4">
                  {/* Quick Actions */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          sendMessage("Analyze my portfolio risks")
                        }
                        disabled={isLoading}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Risk Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          sendMessage(
                            "What are the best DeFi opportunities for me?"
                          )
                        }
                        disabled={isLoading}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        DeFi Opportunities
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          sendMessage("How can I improve my diversification?")
                        }
                        disabled={isLoading}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Diversification
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          sendMessage(
                            "What should I do with my portfolio today?"
                          )
                        }
                        disabled={isLoading}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Daily Advice
                      </Button>
                    </div>
                  </Card>

                  {/* Portfolio Summary */}
                  {portfolio && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Portfolio Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Value:
                          </span>
                          <span className="font-medium">
                            ${portfolio.totalValue?.toFixed(2) || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            24h Change:
                          </span>
                          <span
                            className={`font-medium ${
                              (portfolio.change24hPercent || 0) >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {(portfolio.change24hPercent || 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tokens:</span>
                          <span className="font-medium">
                            {portfolio.tokens?.length || 0}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              {isAnalyzing ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    AI is analyzing your portfolio...
                  </p>
                </Card>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Portfolio Analysis Summary
                    </h3>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </Card>

                  {/* Risk Assessment */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-destructive" />
                      Risk Assessment
                    </h3>
                    <p className="text-muted-foreground">
                      {analysis.riskAssessment}
                    </p>
                  </Card>

                  {/* Opportunities */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Opportunities
                    </h3>
                    <div className="space-y-3">
                      {analysis.opportunities.map((opportunity, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                        >
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span>{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Key Insights
                      </h3>
                      <div className="space-y-4">
                        {analysis.insights.map((insight, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getSeverityColor(
                              insight.severity
                            )}`}
                          >
                            <div className="flex items-start gap-3">
                              {getInsightIcon(insight.type)}
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">
                                  {insight.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {insight.description}
                                </p>
                                {insight.actionItems &&
                                  insight.actionItems.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Action Items:
                                      </p>
                                      <ul className="space-y-1">
                                        {insight.actionItems.map(
                                          (action, actionIndex) => (
                                            <li
                                              key={actionIndex}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                              <span>{action}</span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Market Outlook */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Market Outlook
                    </h3>
                    <p className="text-muted-foreground">
                      {analysis.marketOutlook}
                    </p>
                  </Card>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Analysis Available
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your wallet and let AI analyze your portfolio.
                  </p>
                  <Button onClick={analyzePortfolio} disabled={!portfolio}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Portfolio
                  </Button>
                </Card>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Personalized Recommendations
                </h3>
                <Button onClick={handleGetRecommendations} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Get New Recommendations
                </Button>
              </div>

              {recommendations ? (
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">AI Recommendations</h4>
                      <Badge
                        variant={
                          recommendations.riskLevel === "high"
                            ? "destructive"
                            : recommendations.riskLevel === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {recommendations.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {recommendations.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-muted/20">
                      <p className="text-sm font-medium mb-1">Reasoning:</p>
                      <p className="text-sm text-muted-foreground">
                        {recommendations.reasoning}
                      </p>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    Get AI Recommendations
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click the button above to get personalized recommendations
                    for your portfolio.
                  </p>
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AI;

