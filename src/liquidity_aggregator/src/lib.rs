use candid::{CandidType, Encode, Decode};
use serde::{Deserialize, Serialize};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use std::borrow::Cow;

// =====================
// Enums & Data Structs
// =====================
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum SupportedChain {
    ICP, Ethereum, Bitcoin, Solana, Polygon, Arbitrum, Optimism,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenPair {
    pub token_a: String,
    pub token_b: String,
    pub chain: SupportedChain,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct LiquidityPool {
    pub pair: TokenPair,
    pub dex_name: String,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub fee_rate: u32,
    pub last_updated: u64,
    pub pool_address: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapHop {
    pub pool: LiquidityPool,
    pub input_amount: u64,
    pub output_amount: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapRoute {
    pub input_token: String,
    pub output_token: String,
    pub input_amount: u64,
    pub expected_output: u64,
    pub price_impact: u32,
    pub total_fee: u64,
    pub hops: Vec<SwapHop>,
    pub estimated_gas: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CrossChainQuote {
    pub route: SwapRoute,
    pub bridge_fee: u64,
    pub execution_fee_icp: u64,
    pub execution_fee_native: u64,
    pub total_time_estimate: u64,
    pub confidence_score: u8,
}

// =====================
// Storable Implementations
// =====================
impl Storable for LiquidityPool {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for SwapRoute {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// =====================
// Global State
// =====================
type PoolStorage = StableBTreeMap<String, LiquidityPool, DefaultMemoryImpl>;
type RouteCache = StableBTreeMap<String, SwapRoute, DefaultMemoryImpl>;

thread_local! {
    static LIQUIDITY_POOLS: RefCell<PoolStorage> = RefCell::new(StableBTreeMap::init(DefaultMemoryImpl::default()));
    static ROUTE_CACHE: RefCell<RouteCache> = RefCell::new(StableBTreeMap::init(DefaultMemoryImpl::default()));
    static LAST_UPDATE: RefCell<u64> = RefCell::new(0);
}

// =====================
// Initialization
// =====================
#[init]
fn init() {
    initialize_mock_pools();
}

fn initialize_mock_pools() {
    let pools = vec![
        LiquidityPool {
            pair: TokenPair { token_a: "ETH".to_string(), token_b: "USDC".to_string(), chain: SupportedChain::Ethereum },
            dex_name: "Uniswap V3".to_string(),
            reserve_a: 5_000_000_000_000_000_000,
            reserve_b: 12_000_000_000_000,
            fee_rate: 30,
            last_updated: time(),
            pool_address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640".to_string(),
        },
        LiquidityPool {
            pair: TokenPair { token_a: "ETH".to_string(), token_b: "USDC".to_string(), chain: SupportedChain::Arbitrum },
            dex_name: "SushiSwap".to_string(),
            reserve_a: 2_500_000_000_000_000_000,
            reserve_b: 6_000_000_000_000,
            fee_rate: 25,
            last_updated: time(),
            pool_address: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443".to_string(),
        },
        LiquidityPool {
            pair: TokenPair { token_a: "SOL".to_string(), token_b: "USDC".to_string(), chain: SupportedChain::Solana },
            dex_name: "Serum".to_string(),
            reserve_a: 800_000_000_000_000,
            reserve_b: 80_000_000_000_000,
            fee_rate: 20,
            last_updated: time(),
            pool_address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM".to_string(),
        },
    ];

    LIQUIDITY_POOLS.with(|pools_ref| {
        let mut pools_map = pools_ref.borrow_mut();
        for pool in pools {
            let pool_id = format!("{}_{}_{}_{}", pool.pair.token_a, pool.pair.token_b, format!("{:?}", pool.pair.chain), pool.dex_name);
            pools_map.insert(pool_id, pool);
        }
    });
}

// =====================
// Queries
// =====================
#[query]
fn get_all_pools() -> Vec<LiquidityPool> {
    LIQUIDITY_POOLS.with(|pools_ref| pools_ref.borrow().iter().map(|(_, pool)| pool.clone()).collect())
}

#[query]
fn get_pools_for_pair(token_a: String, token_b: String) -> Vec<LiquidityPool> {
    LIQUIDITY_POOLS.with(|pools_ref| {
        pools_ref.borrow().iter()
            .filter_map(|(_, pool)| {
                if (pool.pair.token_a == token_a && pool.pair.token_b == token_b) ||
                   (pool.pair.token_a == token_b && pool.pair.token_b == token_a) {
                    Some(pool.clone())
                } else { None }
            })
            .collect()
    })
}

#[query]
fn get_aggregated_liquidity(token_a: String, token_b: String) -> Result<(u64, u64), String> {
    let pools = get_pools_for_pair(token_a, token_b);
    if pools.is_empty() { return Err("No pools found for this pair".to_string()); }

    Ok((
        pools.iter().map(|p| p.reserve_a).sum(),
        pools.iter().map(|p| p.reserve_b).sum()
    ))
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to the Liquidity Aggregation Hub.", name)
}

// =====================
// Updates
// =====================
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
        } else { Err("Pool not found".to_string()) }
    })
}

#[update]
fn refresh_liquidity_data() -> Result<String, String> {
    LAST_UPDATE.with(|last_ref| *last_ref.borrow_mut() = time());
    
    LIQUIDITY_POOLS.with(|pools_ref| {
        let mut pools_map = pools_ref.borrow_mut();
        for (pool_id, mut pool) in pools_map.iter() {
            let change_factor = 950 + (time() % 100); // 95% to 105%
            pool.reserve_a = (pool.reserve_a * change_factor) / 1000;
            pool.reserve_b = (pool.reserve_b * change_factor) / 1000;
            pool.last_updated = time();
            pools_map.insert(pool_id.clone(), pool);
        }
    });

    Ok("Liquidity data refreshed successfully".to_string())
}

// =====================
// Helper Functions
// =====================
fn calculate_swap_output(pool: &LiquidityPool, input_token: &str, input_amount: u64) -> Result<(u64, u32), String> {
    let (reserve_in, reserve_out) = if pool.pair.token_a == input_token { (pool.reserve_a, pool.reserve_b) }
    else if pool.pair.token_b == input_token { (pool.reserve_b, pool.reserve_a) }
    else { return Err("Token not found in pool".to_string()); };

    let fee_multiplier = 10000 - pool.fee_rate;
    let numerator = input_amount * fee_multiplier as u64 * reserve_out;
    let denominator = reserve_in * 10000 + input_amount * fee_multiplier as u64;
    let output_amount = numerator / denominator;

    let price_impact = ((input_amount * 10000) / reserve_in) as u32;
    Ok((output_amount, price_impact))
}

fn calculate_fee(amount: u64, fee_rate: u32) -> u64 { (amount * fee_rate as u64) / 10000 }

fn estimate_gas_cost(chain: &SupportedChain) -> u64 {
    match chain {
        SupportedChain::Ethereum => 150_000,
        SupportedChain::Arbitrum => 80_000,
        SupportedChain::Polygon => 100_000,
        SupportedChain::Optimism => 85_000,
        SupportedChain::Solana => 5_000,
        SupportedChain::ICP => 1_000,
        SupportedChain::Bitcoin => 250,
    }
}

fn create_cross_chain_quote(route: SwapRoute) -> CrossChainQuote {
    CrossChainQuote {
        route,
        bridge_fee: 5_000,
        execution_fee_icp: 1_000,
        execution_fee_native: route.estimated_gas * 20,
        total_time_estimate: 300,
        confidence_score: 85,
    }
}

// =====================
// Routing (simplified demo)
// =====================
#[query]
fn find_best_route(input_token: String, output_token: String, input_amount: u64, max_hops: u8) -> Result<CrossChainQuote, String> {
    let route_key = format!("{}_{}_{}_{}", input_token, output_token, input_amount, max_hops);

    // Check cache
    if let Some(cached) = ROUTE_CACHE.with(|cache| cache.borrow().get(&route_key)) {
        if time() - cached.hops.first().map(|h| h.pool.last_updated).unwrap_or(0) < 300_000_000_000 {
            return Ok(create_cross_chain_quote(cached.clone()));
        }
    }

    // Find route
    let best_route = find_optimal_route(input_token.clone(), output_token.clone(), input_amount, max_hops)?;
    ROUTE_CACHE.with(|cache| { cache.borrow_mut().insert(route_key, best_route.clone()); });
    Ok(create_cross_chain_quote(best_route))
}

fn find_optimal_route(input_token: String, output_token: String, input_amount: u64, _max_hops: u8) -> Result<SwapRoute, String> {
    for pool in get_all_pools() {
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
                hops: vec![SwapHop { pool, input_amount, output_amount }],
                estimated_gas: estimate_gas_cost(&pool.pair.chain),
            });
        }
    }
    Err("No direct route found. Multi-hop routing not implemented in demo.".to_string())
}
