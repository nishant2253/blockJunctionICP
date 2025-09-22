// BlockJunction Frontend Configuration
// Reads canister IDs and API keys from Vite environment variables
// Automatically populated by dfx deploy

// Determine network
const network =
  import.meta.env.VITE_DFX_NETWORK || import.meta.env.DFX_NETWORK || "local";

// Debug logging (optional, can be removed in production)
if (import.meta.env.MODE !== "production") {
  console.log("Loading config with network:", network);
  console.log("All environment variables:", import.meta.env);
  console.log("Key environment variables:", {
    liquidityAggregator: import.meta.env.VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR,
    swapExecutor: import.meta.env.VITE_CANISTER_ID_SWAP_EXECUTOR,
    backend: import.meta.env.VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND,
    internetIdentity: import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY,
  });
}

// Default canister IDs for local development
const defaultCanisters = {
  liquidityAggregator: "umunu-kh777-77774-qaaca-cai",
  swapExecutor: "ulvla-h7777-77774-qaacq-cai",
  backend: "uxrrr-q7777-77774-qaaaq-cai",
  internetIdentity: "uzt4z-lp777-77774-qaabq-cai",
};

// Network URLs
const urls = {
  docs: "https://github.com/your-username/blockchain-junction/blob/main/CROSS_CHAIN_FEATURES.md",
  support: "mailto:support@blockjunction.io",
  github: "https://github.com/your-username/blockchain-junction",
  discord: "https://discord.gg/cA7y6ezyE2",
  local: "http://localhost:4943",
  ic: "https://ic0.app",
};

// Supported chains
const chains = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl:
      import.meta.env.VITE_ETHEREUM_RPC_URL ||
      "https://mainnet.infura.io/v3/your-key",
    icon: "🟣",
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    symbol: "ETH",
    rpcUrl:
      import.meta.env.VITE_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    icon: "🔷",
  },
  polygon: {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com",
    icon: "🟪",
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    rpcUrl:
      import.meta.env.VITE_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    icon: "🟢",
  },
  internetComputer: {
    name: "Internet Computer",
    symbol: "ICP",
    rpcUrl: "https://ic0.app",
    icon: "🔵",
  },
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    rpcUrl: "https://blockstream.info/api",
    icon: "🟠",
  },
};

// DEX configurations
const dexes = {
  uniswapV3: {
    name: "Uniswap V3",
    chains: ["ethereum", "arbitrum", "polygon"],
    feeStructure: [0.05, 0.3, 1.0],
  },
  sushiSwap: {
    name: "SushiSwap",
    chains: ["ethereum", "arbitrum", "polygon"],
    feeStructure: [0.3],
  },
  serum: { name: "Serum", chains: ["solana"], feeStructure: [0.22] },
  quickSwap: { name: "QuickSwap", chains: ["polygon"], feeStructure: [0.3] },
  icpSwap: {
    name: "ICPSwap",
    chains: ["internetComputer"],
    feeStructure: [0.05],
  },
};

// Application settings
const appSettings = {
  name: "BlockJunction",
  tagline: "The Ultimate Cross-Chain DEX Aggregator",
  version: "1.0.0",
  maxSlippage: 2.5,
  defaultGasPrice: "fast",
  refreshInterval: 10000,
  routeTimeout: 30000,
};

// Export configuration
export const config = {
  canisters: {
    liquidityAggregator:
      import.meta.env.VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR ||
      defaultCanisters.liquidityAggregator,
    swapExecutor:
      import.meta.env.VITE_CANISTER_ID_SWAP_EXECUTOR ||
      defaultCanisters.swapExecutor,
    backend:
      import.meta.env.VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND ||
      defaultCanisters.backend,
    internetIdentity:
      import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY ||
      defaultCanisters.internetIdentity,
  },
  urls,
  network,
  apis: {
    coinMarketCap: import.meta.env.VITE_COINMARKETCAP_API_KEY,
    coinGecko: import.meta.env.VITE_COINGECKO_API_KEY,
    moralis: import.meta.env.VITE_MORALIS_API_KEY,
  },
  chains,
  dexes,
  app: appSettings,
};
