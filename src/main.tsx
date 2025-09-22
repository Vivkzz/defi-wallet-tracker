import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { WagmiConfig, createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  bsc,
  polygonMumbai,
} from "wagmi/chains";

const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism, bsc, polygonMumbai],
  transports: {
    // Prefer publicnode endpoints that allow browser CORS
    [mainnet.id]: http("https://ethereum.publicnode.com"),
    [sepolia.id]: http("https://sepolia.publicnode.com"),
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [arbitrum.id]: http("https://arbitrum-one.publicnode.com"),
    [optimism.id]: http("https://optimism.publicnode.com"),
    [bsc.id]: http("https://bsc.publicnode.com"),
    [polygonMumbai.id]: http("https://polygon-mumbai-bor.publicnode.com"),
  },
});

createRoot(document.getElementById("root")!).render(
  <WagmiConfig config={config}>
    <App />
  </WagmiConfig>
);
