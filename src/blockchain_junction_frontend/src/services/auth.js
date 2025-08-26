import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { config } from '../config/index.js';

class AuthService {
  constructor() {
    this.authClient = null;
    this.identity = null;
    this.principal = null;
    this.isAuthenticated = false;
    this.agent = null;
    this.actors = {};
    
    // Initialize auth client
    this.init();
  }

  async init() {
    try {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      });

      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        await this.handleAuthenticated();
      }
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
    }
  }

  async login() {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    try {
      console.log('Starting login process...');
      console.log('Config:', { network: config.network, canisters: config.canisters });
      
      // Validate Internet Identity canister ID
      const internetIdentityCanisterId = config.canisters.internetIdentity;
      console.log('Internet Identity Canister ID:', internetIdentityCanisterId);
      
      if (!internetIdentityCanisterId) {
        console.error('Internet Identity canister ID not found in config');
        console.log('Available canister IDs:', config.canisters);
        throw new Error('Internet Identity canister ID not found. Make sure the canister is deployed.');
      }
      
      const internetIdentityUrl = config.network === 'local' 
        ? `http://${internetIdentityCanisterId}.localhost:4943`
        : 'https://identity.ic0.app';
      
      console.log('Internet Identity URL:', internetIdentityUrl);

      await new Promise((resolve, reject) => {
        this.authClient.login({
          identityProvider: internetIdentityUrl,
          onSuccess: () => {
            console.log('Login successful!');
            resolve();
          },
          onError: (error) => {
            console.error('Login error:', error);
            reject(error);
          },
          windowOpenerFeatures: 'toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100',
        });
      });

      await this.handleAuthenticated();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    if (!this.authClient) {
      return;
    }

    try {
      await this.authClient.logout();
      this.identity = null;
      this.principal = null;
      this.isAuthenticated = false;
      this.agent = null;
      this.actors = {};
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: false } 
      }));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async handleAuthenticated() {
    try {
      this.identity = this.authClient.getIdentity();
      this.principal = this.identity.getPrincipal();
      this.isAuthenticated = true;

      // Create HTTP agent with identity
      this.agent = new HttpAgent({
        identity: this.identity,
        host: config.network === 'local' ? config.urls.local : config.urls.ic,
      });

      // Fetch root key for local development
      if (config.network === 'local') {
        await this.agent.fetchRootKey();
      }

      // Initialize actors
      await this.initializeActors();

      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { 
          isAuthenticated: true, 
          principal: this.principal.toString(),
          identity: this.identity 
        } 
      }));
    } catch (error) {
      console.error('Failed to handle authentication:', error);
    }
  }

  async initializeActors() {
    try {
      // Import IDL files - check if canisters are available first
      if (!config.canisters.liquidityAggregator) {
        console.warn('Liquidity aggregator canister ID not found');
        return;
      }

      if (!config.canisters.swapExecutor) {
        console.warn('Swap executor canister ID not found');
        return;
      }

      if (!config.canisters.backend) {
        console.warn('Backend canister ID not found');
        return;
      }

      const { idlFactory: liquidityAggregatorIdl } = await import('../../../declarations/liquidity_aggregator');
      const { idlFactory: swapExecutorIdl } = await import('../../../declarations/swap_executor');
      const { idlFactory: backendIdl } = await import('../../../declarations/blockchain_junction_backend');

      // Create actors with error handling
      this.actors.liquidityAggregator = Actor.createActor(liquidityAggregatorIdl, {
        agent: this.agent,
        canisterId: config.canisters.liquidityAggregator,
      });

      this.actors.swapExecutor = Actor.createActor(swapExecutorIdl, {
        agent: this.agent,
        canisterId: config.canisters.swapExecutor,
      });

      this.actors.backend = Actor.createActor(backendIdl, {
        agent: this.agent,
        canisterId: config.canisters.backend,
      });

      console.log('Actors initialized successfully');
    } catch (error) {
      console.error('Failed to initialize actors:', error);
      // Continue without actors - this allows the app to work even if canisters aren't deployed
    }
  }

  // Getter methods
  getIdentity() {
    return this.identity;
  }

  getPrincipal() {
    return this.principal;
  }

  getPrincipalText() {
    return this.principal ? this.principal.toString() : null;
  }

  getAgent() {
    return this.agent;
  }

  getActor(actorName) {
    return this.actors[actorName];
  }

  // Utility methods
  isLoggedIn() {
    return this.isAuthenticated && this.principal && !this.principal.isAnonymous();
  }

  // API call wrapper with authentication
  async authenticatedCall(actorName, methodName, args = []) {
    if (!this.isLoggedIn()) {
      throw new Error('User not authenticated');
    }

    const actor = this.getActor(actorName);
    if (!actor) {
      throw new Error(`Actor ${actorName} not available`);
    }

    try {
      return await actor[methodName](...args);
    } catch (error) {
      console.error(`Failed to call ${actorName}.${methodName}:`, error);
      throw error;
    }
  }

  // Wallet connection status
  async getWalletInfo() {
    if (!this.isLoggedIn()) {
      return null;
    }

    return {
      principal: this.getPrincipalText(),
      isConnected: true,
      network: config.network,
    };
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;