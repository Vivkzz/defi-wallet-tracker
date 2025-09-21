import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";
import { Card } from "./card";
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Shield,
  Lightbulb,
  X,
} from "lucide-react";
import { AIMessage, PortfolioInsight } from "../../services/aiService";

interface AIChatProps {
  messages: AIMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearConversation: () => void;
  isConfigured: boolean;
}

export function AIChat({
  messages,
  isLoading,
  onSendMessage,
  onClearConversation,
  isConfigured,
}: AIChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type: "user" | "ai") => {
    return type === "user" ? (
      <User className="h-4 w-4" />
    ) : (
      <Bot className="h-4 w-4" />
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-primary" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const quickQuestions = [
    "What should I do with my portfolio?",
    "Are there any risks I should be aware of?",
    "What are the best DeFi opportunities?",
    "How can I improve my diversification?",
    "Should I stake my tokens?",
  ];

  if (!isConfigured) {
    return (
      <Card className="p-6 text-center">
        <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">AI Portfolio Manager</h3>
        <p className="text-muted-foreground mb-4">
          To use the AI features, please configure your Gemini API key in the
          environment variables.
        </p>
        <p className="text-sm text-muted-foreground">
          Set VITE_GEMINI_API_KEY in your .env file
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Portfolio Manager</h3>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Minimize" : "Expand"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearConversation}
            disabled={messages.length === 0}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">
                Welcome to your AI Portfolio Manager!
              </h4>
              <p className="text-muted-foreground mb-4">
                Ask me anything about your portfolio, DeFi strategies, or market
                insights.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onSendMessage(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* Portfolio Insights */}
                  {message.portfolioInsights &&
                    message.portfolioInsights.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.portfolioInsights.map(
                          (insight: PortfolioInsight, index: number) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border ${getSeverityColor(
                                insight.severity
                              )}`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                {getInsightIcon(insight.type)}
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">
                                    {insight.title}
                                  </h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {insight.description}
                                  </p>
                                </div>
                              </div>
                              {insight.actionItems &&
                                insight.actionItems.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium mb-1">
                                      Action Items:
                                    </p>
                                    <ul className="text-xs space-y-1">
                                      {insight.actionItems.map(
                                        (action, actionIndex) => (
                                          <li
                                            key={actionIndex}
                                            className="flex items-start gap-1"
                                          >
                                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span>{action}</span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your portfolio..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

