// BlockJunction Frontend Configuration
// Read canister IDs from Vite environment variables (prefixed with VITE_)
// These are automatically populated by dfx deploy

// Determine network
const network = import.meta.env.VITE_DFX_NETWORK || import.meta.env.DFX_NETWORK || 'local';

// Debug logging
console.log('Loading config with network:', network);
console.log('All import.meta.env:', import.meta.env);
console.log('Specific environment variables:', {
  VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR: import.meta.env.VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR,
  VITE_CANISTER_ID_SWAP_EXECUTOR: import.meta.env.VITE_CANISTER_ID_SWAP_EXECUTOR,
  VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND: import.meta.env.VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND,
  VITE_CANISTER_ID_INTERNET_IDENTITY: import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY,
});

export const config = {
  // Canister IDs (with fallbacks for local development)
  canisters: {
    liquidityAggregator: import.meta.env.VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR || 'umunu-kh777-77774-qaaca-cai',
    swapExecutor: import.meta.env.VITE_CANISTER_ID_SWAP_EXECUTOR || 'ulvla-h7777-77774-qaacq-cai',
    backend: import.meta.env.VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai',
    internetIdentity: import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || 'uzt4z-lp777-77774-qaabq-cai'
  },
  
  // Network URLs
  urls: {
    docs: 'https://github.com/your-username/blockchain-junction/blob/main/CROSS_CHAIN_FEATURES.md',
    support: 'mailto:support@blockjunction.io',
    github: 'https://github.com/your-username/blockchain-junction',
    discord: 'https://discord.gg/cA7y6ezyE2',
    local: 'http://localhost:4943',
    ic: 'https://ic0.app'
  },
  
  // Network configuration
  network: network,
  
  // API endpoints (for production use)
  apis: {
    coinMarketCap: import.meta.env.VITE_COINMARKETCAP_API_KEY,
    coinGecko: import.meta.env.VITE_COINGECKO_API_KEY,
    moralis: import.meta.env.VITE_MORALIS_API_KEY
  },
  
  // Supported chains and their configurations
  chains: {
    ethereum: {
      id: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-key',
      icon: '🟣'
    },
    arbitrum: {
      id: 42161,
      name: 'Arbitrum',
      symbol: 'ETH',
      rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      icon: '🔷'
    },
    polygon: {
      id: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
      icon: '🟪'
    },
    solana: {
      name: 'Solana',
      symbol: 'SOL',
      rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      icon: '🟢'
    },
    internetComputer: {
      name: 'Internet Computer',
      symbol: 'ICP',
      rpcUrl: 'https://ic0.app',
      icon: '🔵'
    },
    bitcoin: {
      name: 'Bitcoin',
      symbol: 'BTC',
      rpcUrl: 'https://blockstream.info/api',
      icon: '🟠'
    }
  },
  
  // DEX configurations
  dexes: {
    uniswapV3: {
      name: 'Uniswap V3',
      chains: ['ethereum', 'arbitrum', 'polygon'],
      feeStructure: [0.05, 0.30, 1.00] // Fee tiers in percentages
    },
    sushiSwap: {
      name: 'SushiSwap',
      chains: ['ethereum', 'arbitrum', 'polygon'],
      feeStructure: [0.30]
    },
    serum: {
      name: 'Serum',
      chains: ['solana'],
      feeStructure: [0.22]
    },
    quickSwap: {
      name: 'QuickSwap',
      chains: ['polygon'],
      feeStructure: [0.30]
    },
    icpSwap: {
      name: 'ICPSwap',
      chains: ['internetComputer'],
      feeStructure: [0.05]
    }
  },
  
  // Application settings
  app: {
    name: 'BlockJunction',
    tagline: 'The Ultimate Cross-Chain DEX Aggregator',
    version: '1.0.0',
    maxSlippage: 2.5, // Default max slippage in percentage
    defaultGasPrice: 'fast', // fast, standard, safe
    refreshInterval: 10000, // 10 seconds for data refresh
    routeTimeout: 30000 // 30 seconds timeout for route finding
  }
};
