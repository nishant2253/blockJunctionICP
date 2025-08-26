// Configuration file for BlockJunction Frontend
// Loads environment variables and provides app configuration

const getCanisterIds = () => {
  const { VITE_DFX_NETWORK, VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR, VITE_CANISTER_ID_SWAP_EXECUTOR, VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND, VITE_CANISTER_ID_INTERNET_IDENTITY } = import.meta.env;

  try {
    // Fallback canister IDs from canister_ids.json (hardcoded for now to fix the import issue)
    const localCanisterIds = {
      liquidity_aggregator: { local: 'umunu-kh777-77774-qaaca-cai' },
      swap_executor: { local: 'ulvla-h7777-77774-qaacq-cai' },
      blockchain_junction_backend: { local: 'ucwa4-rx777-77774-qaada-cai' },
      internet_identity: { local: 'uzt4z-lp777-77774-qaabq-cai' },
    };

    if (VITE_DFX_NETWORK === 'local') {
      return {
        liquidityAggregator: VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR || localCanisterIds.liquidity_aggregator.local,
        swapExecutor: VITE_CANISTER_ID_SWAP_EXECUTOR || localCanisterIds.swap_executor.local,
        backend: VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND || localCanisterIds.blockchain_junction_backend.local,
        internetIdentity: VITE_CANISTER_ID_INTERNET_IDENTITY || localCanisterIds.internet_identity.local,
      };
    }
    
    // For production, use environment variables
    return {
      liquidityAggregator: VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR,
      swapExecutor: VITE_CANISTER_ID_SWAP_EXECUTOR,
      backend: VITE_CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND,
      internetIdentity: VITE_CANISTER_ID_INTERNET_IDENTITY,
    };
  } catch (error) {
    console.error('Failed to load canister IDs:', error);
    return {
      liquidityAggregator: null,
      swapExecutor: null,
      backend: null,
      internetIdentity: null,
    };
  }
};

// Environment variables with fallbacks
export const config = {
  // Network Configuration
  network: import.meta.env.VITE_DFX_NETWORK || 'local',
  icNetwork: import.meta.env.VITE_IC_NETWORK || 'local',
  
  // Canister IDs
  canisters: getCanisterIds(),
  
  // API Configuration
  apis: {
    coinMarketCap: import.meta.env.VITE_COINMARKETCAP_API_KEY,
    coinGecko: import.meta.env.VITE_COINGECKO_API_KEY,
    moralis: import.meta.env.VITE_MORALIS_API_KEY,
    uniswapSubgraph: import.meta.env.VITE_UNISWAP_SUBGRAPH_KEY,
    sushiswapSubgraph: import.meta.env.VITE_SUSHISWAP_SUBGRAPH_KEY,
  },
  
  // RPC Endpoints
  rpc: {
    ethereum: import.meta.env.VITE_ETHEREUM_RPC_URL,
    arbitrum: import.meta.env.VITE_ARBITRUM_RPC_URL,
    polygon: import.meta.env.VITE_POLYGON_RPC_URL,
    optimism: import.meta.env.VITE_OPTIMISM_RPC_URL,
    solana: import.meta.env.VITE_SOLANA_RPC_URL,
  },
  
  // App Configuration
  app: {
    name: 'BlockJunction',
    version: '1.0.0',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    port: import.meta.env.VITE_REACT_APP_PORT || 3000,
    host: import.meta.env.VITE_REACT_APP_HOST || 'localhost',
  },
  
  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    enableTestMode: import.meta.env.VITE_NODE_ENV === 'development',
  },
  
  // API Settings
  settings: {
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    maxBatchSize: parseInt(import.meta.env.VITE_MAX_BATCH_SIZE) || 50,
    maxRouteHops: parseInt(import.meta.env.VITE_MAX_ROUTE_HOPS) || 3,
    priceUpdateInterval: 30000, // 30 seconds
    liquidityUpdateInterval: 60000, // 1 minute
  },
  
  // URLs
  urls: {
    local: 'http://localhost:4943',
    ic: 'https://ic0.app',
    docs: 'https://docs.blockjunction.io',
    support: 'https://support.blockjunction.io',
  },
};

// Helper functions
export const getCanisterUrl = (canisterId) => {
  const baseUrl = config.network === 'local' ? config.urls.local : config.urls.ic;
  return `${baseUrl}/?canisterId=${canisterId}`;
};

export const isProduction = () => config.app.environment === 'production';
export const isDevelopment = () => config.app.environment === 'development';

// Validation
export const validateConfig = () => {
  const errors = [];
  
  // Check required canister IDs
  if (!config.canisters.liquidityAggregator) {
    errors.push('Missing VITE_CANISTER_ID_LIQUIDITY_AGGREGATOR');
  }
  
  if (!config.canisters.swapExecutor) {
    errors.push('Missing VITE_CANISTER_ID_SWAP_EXECUTOR');
  }
  
  // Check API keys in production
  if (isProduction()) {
    if (!config.apis.coinMarketCap && !config.apis.coinGecko) {
      errors.push('Missing price API keys (CoinMarketCap or CoinGecko required)');
    }
    
    if (!config.rpc.ethereum) {
      errors.push('Missing VITE_ETHEREUM_RPC_URL');
    }
  }
  
  return errors;
};

// Initialize and validate config
const configErrors = validateConfig();
if (configErrors.length > 0 && isProduction()) {
  console.error('Configuration errors:', configErrors);
}

export default config;