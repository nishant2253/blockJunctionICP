// Debug script to test authentication configuration
import { config } from './src/config/index.js';

console.log('=== BlockJunction Authentication Debug ===');
console.log('Network:', config.network);
console.log('Canister IDs:');
console.log('  - Liquidity Aggregator:', config.canisters.liquidityAggregator);
console.log('  - Swap Executor:', config.canisters.swapExecutor);
console.log('  - Backend:', config.canisters.backend);
console.log('  - Internet Identity:', config.canisters.internetIdentity);

console.log('\nURLs:');
console.log('  - Local:', config.urls.local);
console.log('  - IC:', config.urls.ic);

console.log('\nEnvironment Variables:');
console.log('  - VITE_DFX_NETWORK:', import.meta.env.VITE_DFX_NETWORK);
console.log('  - VITE_CANISTER_ID_INTERNET_IDENTITY:', import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY);

// Test Internet Identity URL construction
const internetIdentityUrl = config.network === 'local' 
  ? `http://${config.canisters.internetIdentity}.localhost:4943`
  : 'https://identity.ic0.app';

console.log('\nInternet Identity URL:', internetIdentityUrl);

// Test if canisters are accessible
const testCanisterConnection = async () => {
  try {
    const response = await fetch(`${config.urls.local}/?canisterId=${config.canisters.internetIdentity}`);
    console.log('Internet Identity canister status:', response.status);
  } catch (error) {
    console.error('Error connecting to Internet Identity canister:', error.message);
  }
};

testCanisterConnection();
