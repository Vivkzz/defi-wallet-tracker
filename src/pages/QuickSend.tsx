import * as React from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { useEffect, useMemo, useState } from "react";
import { AIService } from "../services/aiService";

const QuickSend = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const {
    sendTransaction,
    data: txHash,
    isPending,
    isSuccess,
    error: txError,
  } = useSendTransaction();

  const ai = useMemo(() => new AIService(), []);

  const [nlInput, setNlInput] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ETH");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [action, setAction] = useState<"send" | "burn" | "swap">("send");
  const [toToken, setToToken] = useState<string>("");

  useEffect(() => {
    if (isSuccess && txHash) setStatusMsg(`Transaction sent: ${txHash}`);
  }, [isSuccess, txHash]);

  const handleParse = async () => {
    const parsed = await ai.parseTransferIntent(nlInput);
    if (parsed.recipient) setTo(parsed.recipient);
    if (parsed.amount !== undefined) setAmount(String(parsed.amount));
    if (parsed.token) setToken(parsed.token);
    if (parsed.action) setAction(parsed.action);
    if (parsed.toToken) setToToken(parsed.toToken);
    if (parsed.chainHint) {
      try {
        if (parsed.chainHint === "sepolia" && chainId !== 11155111)
          await switchChainAsync({ chainId: 11155111 });
        if (parsed.chainHint === "mainnet" && chainId !== 1)
          await switchChainAsync({ chainId: 1 });
        if (parsed.chainHint === "polygon" && chainId !== 137)
          await switchChainAsync({ chainId: 137 });
        if (parsed.chainHint === "arbitrum" && chainId !== 42161)
          await switchChainAsync({ chainId: 42161 });
        if (parsed.chainHint === "optimism" && chainId !== 10)
          await switchChainAsync({ chainId: 10 });
        if (parsed.chainHint === "bsc" && chainId !== 56)
          await switchChainAsync({ chainId: 56 });
      } catch {}
    }
  };

  const handleSend = async () => {
    setStatusMsg(null);
    if (!isConnected) {
      setStatusMsg("Connect your wallet first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setStatusMsg("Enter a valid amount.");
      return;
    }

    if (action === "swap") {
      setStatusMsg("Swap is not yet implemented. Coming soon.");
      return;
    }

    if (action === "burn") {
      const burnAddress = "0x000000000000000000000000000000000000dEaD";
      try {
        sendTransaction({
          to: burnAddress as `0x${string}`,
          value: parseEther(amount),
        });
      } catch (e: any) {
        setStatusMsg(e?.message || "Failed to burn");
      }
      return;
    }

    // send
    if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setStatusMsg("Enter a valid recipient address.");
      return;
    }
    if (token !== "ETH" && token !== "WETH") {
      setStatusMsg("This demo only supports sending native ETH.");
      return;
    }
    try {
      sendTransaction({ to: to as `0x${string}`, value: parseEther(amount) });
    } catch (e: any) {
      setStatusMsg(e?.message || "Failed to send transaction");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 p-6 space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Quick Send</h1>
          <p className="text-muted-foreground mt-1">
            Type or fill the form to create a transaction.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <Label htmlFor="nl">Natural language</Label>
          <Input
            id="nl"
            placeholder="Send 1 ETH to 0xabc... on sepolia"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
          />
          <Button variant="accent" size="sm" onClick={handleParse}>
            Parse with AI
          </Button>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="to">Recipient Address</Label>
              <Input
                id="to"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Action</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={action === "send" ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setAction("send")}
                >
                  Send
                </Button>
                <Button
                  variant={action === "burn" ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setAction("burn")}
                >
                  Burn
                </Button>
                <Button
                  variant={action === "swap" ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setAction("swap")}
                >
                  Swap
                </Button>
              </div>
            </div>
            {action === "swap" && (
              <div>
                <Label htmlFor="toToken">To Token</Label>
                <Input
                  id="toToken"
                  placeholder="USDC"
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={handleSend}
              disabled={isPending}
            >
              {isPending
                ? "Sending..."
                : action === "send"
                ? "Send"
                : action === "burn"
                ? "Burn"
                : "Swap"}
            </Button>
            {statusMsg && (
              <span className="text-sm text-muted-foreground">{statusMsg}</span>
            )}
          </div>
          {txError && (
            <p className="text-sm text-destructive">{txError.message}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuickSend;
