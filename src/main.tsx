import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { WagmiConfig, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

createRoot(document.getElementById("root")!).render(
  <WagmiConfig config={config}>
    <App />
  </WagmiConfig>
);