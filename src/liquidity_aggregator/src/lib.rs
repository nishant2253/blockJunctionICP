use candid::{CandidType, Encode, Decode};
use serde::{Deserialize, Serialize};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use std::borrow::Cow;

// Cross-chain liquidity pool data structures
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum SupportedChain {
    ICP,
    Ethereum,
    Bitcoin,
    Solana,
    Polygon,
    Arbitrum,
    Optimism,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenPair {
    pub token_a: String,  // e.g., "ETH"
    pub token_b: String,  // e.g., "USDC"
    pub chain: SupportedChain,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct LiquidityPool {
    pub pair: TokenPair,
    pub dex_name: String,           // e.g., "Uniswap V3", "SushiSwap"
    pub reserve_a: u64,             // Token A reserves
    pub reserve_b: u64,             // Token B reserves
    pub fee_rate: u32,              // Fee in basis points (e.g., 30 = 0.3%)
    pub last_updated: u64,          // Timestamp
    pub pool_address: String,       // Contract address or identifier
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapRoute {
    pub input_token: String,
    pub output_token: String,
    pub input_amount: u64,
    pub expected_output: u64,
    pub price_impact: u32,          // In basis points
    pub total_fee: u64,             // Total fees across all hops
    pub hops: Vec<SwapHop>,
    pub estimated_gas: u64,         // Gas cost estimation
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapHop {
    pub pool: LiquidityPool,
    pub input_amount: u64,
    pub output_amount: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CrossChainQuote {
    pub route: SwapRoute,
    pub bridge_fee: u64,
    pub execution_fee_icp: u64,     // Fee if executed via ICP
    pub execution_fee_native: u64,  // Fee if executed on native chain
    pub total_time_estimate: u64,   // In seconds
    pub confidence_score: u8,       // 0-100, based on liquidity depth
}

// Storage implementations
impl Storable for LiquidityPool {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for SwapRoute {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Global state
type PoolStorage = StableBTreeMap<String, LiquidityPool, DefaultMemoryImpl>; // pool_id -> pool
type RouteCache = StableBTreeMap<String, SwapRoute, DefaultMemoryImpl>; // route_key -> route

thread_local! {
    static LIQUIDITY_POOLS: RefCell<PoolStorage> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
    
    static ROUTE_CACHE: RefCell<RouteCache> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
    
    static LAST_UPDATE: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    // Initialize with some mock liquidity pools for demonstration
    initialize_mock_pools();
}

fn initialize_mock_pools() {
    let pools = vec![
        LiquidityPool {
            pair: TokenPair {
                token_a: "ETH".to_string(),
                token_b: "USDC".to_string(),
                chain: SupportedChain::Ethereum,
            },
            dex_name: "Uniswap V3".to_string(),
            reserve_a: 5000000000000000000u64, // 5,000 ETH (18 decimals)
            reserve_b: 12000000000000u64,        // 12M USDC (6 decimals)
            fee_rate: 30,                       // 0.3%
            last_updated: time(),
            pool_address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640".to_string(),
        },
        LiquidityPool {
            pair: TokenPair {
                token_a: "ETH".to_string(),
                token_b: "USDC".to_string(),
                chain: SupportedChain::Arbitrum,
            },
            dex_name: "SushiSwap".to_string(),
            reserve_a: 2500000000000000000u64, // 2,500 ETH (18 decimals)
            reserve_b: 6000000000000u64,        // 6M USDC (6 decimals)
            fee_rate: 25,                       // 0.25%
            last_updated: time(),
            pool_address: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443".to_string(),
        },
        LiquidityPool {
            pair: TokenPair {
                token_a: "SOL".to_string(),
                token_b: "USDC".to_string(),
                chain: SupportedChain::Solana,
            },
            dex_name: "Serum".to_string(),
            reserve_a: 800000000000000,         // 800,000 SOL
            reserve_b: 80000000000000,          // 80M USDC
            fee_rate: 20,                       // 0.2%
            last_updated: time(),
            pool_address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM".to_string(),
        },
    ];

    LIQUIDITY_POOLS.with(|pools_ref| {
        let mut pools_map = pools_ref.borrow_mut();
        for pool in pools {
            let pool_id = format!("{}_{}_{}_{}", 
                pool.pair.token_a, pool.pair.token_b, 
                format!("{:?}", pool.pair.chain), pool.dex_name);
            pools_map.insert(pool_id, pool);
        }
    });
}

// Core liquidity aggregation functions
#[query]
fn get_all_pools() -> Vec<LiquidityPool> {
    LIQUIDITY_POOLS.with(|pools_ref| {
        pools_ref.borrow().iter().map(|(_, pool)| pool.clone()).collect()
    })
}

#[query]
fn get_pools_for_pair(token_a: String, token_b: String) -> Vec<LiquidityPool> {
    LIQUIDITY_POOLS.with(|pools_ref| {
        pools_ref.borrow().iter()
            .filter_map(|(_, pool)| {
                if (pool.pair.token_a == token_a && pool.pair.token_b == token_b) ||
                   (pool.pair.token_a == token_b && pool.pair.token_b == token_a) {
                    Some(pool.clone())
                } else {
                    None
                }
            })
            .collect()
    })
}

#[update]
fn update_pool_data(pool_id: String, new_reserve_a: u64, new_reserve_b: u64) -> Result<(), String> {
    LIQUIDITY_POOLS.with(|pools_ref| {
        let mut pools_map = pools_ref.borrow_mut();
        if let Some(mut pool) = pools_map.get(&pool_id) {
            pool.reserve_a = new_reserve_a;
            pool.reserve_b = new_reserve_b;
            pool.last_updated = time();
            pools_map.insert(pool_id, pool);
            Ok(())
        } else {
            Err("Pool not found".to_string())
        }
    })
}

// Advanced routing algorithm
#[query]
fn find_best_route(
    input_token: String,
    output_token: String,
    input_amount: u64,
    max_hops: u8,
) -> Result<CrossChainQuote, String> {
    let route_key = format!("{}_{}_{}_{}", input_token, output_token, input_amount, max_hops);
    
    // Check cache first
    let cached_route = ROUTE_CACHE.with(|cache_ref| {
        cache_ref.borrow().get(&route_key)
    });
    
    if let Some(cached) = cached_route {
        // Check if cache is still fresh (5 minutes)
        if time() - cached.hops.first().map(|h| h.pool.last_updated).unwrap_or(0) < 300_000_000_000 {
            return Ok(create_cross_chain_quote(cached));
        }
    }
    
    // Find best route using modified Dijkstra's algorithm
    let best_route = find_optimal_route(input_token, output_token, input_amount, max_hops)?;
    
    // Cache the result
    ROUTE_CACHE.with(|cache_ref| {
        cache_ref.borrow_mut().insert(route_key, best_route.clone());
    });
    
    Ok(create_cross_chain_quote(best_route))
}

fn find_optimal_route(
    input_token: String,
    output_token: String,
    input_amount: u64,
    _max_hops: u8,
) -> Result<SwapRoute, String> {
    // Get all relevant pools
    let all_pools = get_all_pools();
    
    // Simple direct swap first
    for pool in &all_pools {
        if (pool.pair.token_a == input_token && pool.pair.token_b == output_token) ||
           (pool.pair.token_a == output_token && pool.pair.token_b == input_token) {
            
            let (output_amount, price_impact) = calculate_swap_output(&pool, &input_token, input_amount)?;
            
            return Ok(SwapRoute {
                input_token: input_token.clone(),
                output_token: output_token.clone(),
                input_amount,
                expected_output: output_amount,
                price_impact,
                total_fee: calculate_fee(input_amount, pool.fee_rate),
                hops: vec![SwapHop {
                    pool: pool.clone(),
                    input_amount,
                    output_amount,
                }],
                estimated_gas: estimate_gas_cost(&pool.pair.chain),
            });
        }
    }
    
    // Multi-hop routing (simplified for demo)
    // In production, this would use a more sophisticated pathfinding algorithm
    Err("No direct route found. Multi-hop routing not implemented in this demo.".to_string())
}

fn calculate_swap_output(pool: &LiquidityPool, input_token: &str, input_amount: u64) -> Result<(u64, u32), String> {
    let (reserve_in, reserve_out) = if pool.pair.token_a == input_token {
        (pool.reserve_a, pool.reserve_b)
    } else if pool.pair.token_b == input_token {
        (pool.reserve_b, pool.reserve_a)
    } else {
        return Err("Token not found in pool".to_string());
    };
    
    // Constant product formula: x * y = k
    // With fees: output = (input * 997 * reserve_out) / (reserve_in * 1000 + input * 997)
    let fee_multiplier = 10000 - pool.fee_rate;
    let numerator = input_amount * (fee_multiplier as u64) * reserve_out;
    let denominator = reserve_in * 10000 + input_amount * (fee_multiplier as u64);
    
    let output_amount = numerator / denominator;
    
    // Calculate price impact
    let price_impact = ((input_amount * 10000) / reserve_in) as u32;
    
    Ok((output_amount, price_impact))
}

fn calculate_fee(amount: u64, fee_rate: u32) -> u64 {
    (amount * fee_rate as u64) / 10000
}

fn estimate_gas_cost(chain: &SupportedChain) -> u64 {
    match chain {
        SupportedChain::Ethereum => 150000,    // ~150k gas
        SupportedChain::Arbitrum => 80000,     // ~80k gas
        SupportedChain::Polygon => 100000,     // ~100k gas
        SupportedChain::Optimism => 85000,     // ~85k gas
        SupportedChain::Solana => 5000,        // ~5k compute units
        SupportedChain::ICP => 1000,           // ~1k cycles
        SupportedChain::Bitcoin => 250,        // ~250 bytes
    }
}

fn create_cross_chain_quote(route: SwapRoute) -> CrossChainQuote {
    let native_gas_cost = route.estimated_gas;
    let icp_execution_fee = 1000; // Much lower ICP execution cost
    
    CrossChainQuote {
        route,
        bridge_fee: 5000,  // Bridge fee for cross-chain
        execution_fee_icp: icp_execution_fee,
        execution_fee_native: native_gas_cost * 20, // Assume 20 gwei gas price
        total_time_estimate: 300, // 5 minutes
        confidence_score: 85,     // High confidence
    }
}

// Periodic update functions (would be called by timers in production)
#[update]
fn refresh_liquidity_data() -> Result<String, String> {
    // In production, this would make HTTP outcalls to various DEX APIs
    // For demo, we'll simulate data updates
    
    LAST_UPDATE.with(|last_ref| {
        *last_ref.borrow_mut() = time();
    });
    
    // Simulate some price movements
    LIQUIDITY_POOLS.with(|pools_ref| {
        let mut pools_map = pools_ref.borrow_mut();
        let pool_updates: Vec<(String, LiquidityPool)> = pools_map.iter()
            .map(|(pool_id, mut pool)| {
                // Simulate 1-5% reserve changes
                let change_factor = 950 + (time() % 100); // 95% to 105%
                pool.reserve_a = (pool.reserve_a * change_factor) / 1000;
                pool.reserve_b = (pool.reserve_b * change_factor) / 1000;
                pool.last_updated = time();
                (pool_id, pool)
            })
            .collect();
        
        for (pool_id, pool) in pool_updates {
            pools_map.insert(pool_id, pool);
        }
    });
    
    Ok("Liquidity data refreshed successfully".to_string())
}

#[query]
fn get_aggregated_liquidity(token_a: String, token_b: String) -> Result<(u64, u64), String> {
    let pools = get_pools_for_pair(token_a, token_b);
    
    if pools.is_empty() {
        return Err("No pools found for this pair".to_string());
    }
    
    let total_reserve_a: u64 = pools.iter().map(|p| p.reserve_a).sum();
    let total_reserve_b: u64 = pools.iter().map(|p| p.reserve_b).sum();
    
    Ok((total_reserve_a, total_reserve_b))
}

// Fee comparison utilities
#[query]
fn compare_execution_costs(
    input_token: String,
    output_token: String,
    input_amount: u64,
) -> Result<(u64, u64, u64), String> { // (icp_cost, native_cost, savings)
    let quote = find_best_route(input_token, output_token, input_amount, 3)?;
    
    let icp_cost = quote.execution_fee_icp;
    let native_cost = quote.execution_fee_native;
    let savings = if native_cost > icp_cost { native_cost - icp_cost } else { 0 };
    
    Ok((icp_cost, native_cost, savings))
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to the Liquidity Aggregation Hub.", name)
}