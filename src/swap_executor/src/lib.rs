use candid::{CandidType, Principal, Encode, Decode};
use serde::{Deserialize, Serialize};
use ic_cdk::api::time;
use ic_cdk_macros::{init, update, query};
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound, memory_manager::{MemoryManager, MemoryId, VirtualMemory}};
use std::borrow::Cow;
use sha2::{Sha256, Digest};

// Batch execution and fee reduction structures
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum ExecutionChain {
    ICP,
    Ethereum,
    Bitcoin,
    Solana,
    Polygon,
    Arbitrum,
    Optimism,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapOrder {
    pub id: u64,
    pub user: Principal,
    pub input_token: String,
    pub output_token: String,
    pub input_amount: u64,
    pub min_output_amount: u64,
    pub target_chain: ExecutionChain,
    pub deadline: u64,
    pub created_at: u64,
    pub nonce: u64,                    // For idempotency
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BatchExecution {
    pub batch_id: u64,
    pub orders: Vec<SwapOrder>,
    pub total_gas_saved: u64,
    pub execution_chain: ExecutionChain,
    pub status: BatchStatus,
    pub created_at: u64,
    pub executed_at: Option<u64>,
    pub transaction_hash: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub enum BatchStatus {
    Pending,
    Executing,
    Completed,
    Failed,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ExecutionResult {
    pub order_id: u64,
    pub success: bool,
    pub output_amount: Option<u64>,
    pub gas_used: u64,
    pub error_message: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FeeComparison {
    pub individual_execution_cost: u64,
    pub batched_execution_cost: u64,
    pub icp_execution_cost: u64,
    pub savings_vs_individual: u64,
    pub savings_vs_native: u64,
    pub efficiency_score: u8,          // 0-100
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct IdempotencyRecord {
    pub user: Principal,
    pub nonce: u64,
    pub order_hash: String,
    pub order_id: Option<u64>,
    pub created_at: u64,
}

// Storage implementations
impl Storable for SwapOrder {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for BatchExecution {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for IdempotencyRecord {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;
type OrderStorage = StableBTreeMap<u64, SwapOrder, Memory>;
type BatchStorage = StableBTreeMap<u64, BatchExecution, Memory>;
type IdempotencyStorage = StableBTreeMap<String, IdempotencyRecord, Memory>;

const ORDERS_MEMORY_ID: MemoryId = MemoryId::new(0);
const BATCHES_MEMORY_ID: MemoryId = MemoryId::new(1);
const IDEMPOTENCY_MEMORY_ID: MemoryId = MemoryId::new(2);
const COUNTERS_MEMORY_ID: MemoryId = MemoryId::new(3);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static ORDERS: RefCell<OrderStorage> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ORDERS_MEMORY_ID))
        )
    );
    
    static BATCHES: RefCell<BatchStorage> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(BATCHES_MEMORY_ID))
        )
    );
    
    static IDEMPOTENCY: RefCell<IdempotencyStorage> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(IDEMPOTENCY_MEMORY_ID))
        )
    );
    
    static NEXT_ORDER_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_BATCH_ID: RefCell<u64> = RefCell::new(1);
}

#[init]
fn init() {
    ic_cdk::println!("Swap Executor canister initialized");
}

// Helper functions
fn get_next_order_id() -> u64 {
    NEXT_ORDER_ID.with(|id_counter| {
        let current_id = *id_counter.borrow();
        *id_counter.borrow_mut() = current_id + 1;
        current_id
    })
}

fn get_next_batch_id() -> u64 {
    NEXT_BATCH_ID.with(|id_counter| {
        let current_id = *id_counter.borrow();
        *id_counter.borrow_mut() = current_id + 1;
        current_id
    })
}

fn calculate_order_hash(order: &SwapOrder) -> String {
    let mut hasher = Sha256::new();
    hasher.update(format!("{:?}", order));
    format!("{:x}", hasher.finalize())
}

// Core swap execution functions
#[update]
fn create_swap_order(
    input_token: String,
    output_token: String,
    input_amount: u64,
    min_output_amount: u64,
    target_chain: ExecutionChain,
    deadline_seconds: u64,
    nonce: u64,
) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed".to_string());
    }

    let current_time = time();
    let deadline = current_time + (deadline_seconds * 1_000_000_000); // Convert to nanoseconds

    let order = SwapOrder {
        id: 0, // Will be set after getting ID
        user: caller,
        input_token,
        output_token,
        input_amount,
        min_output_amount,
        target_chain,
        deadline,
        created_at: current_time,
        nonce,
    };

    // Check for idempotency
    let order_hash = calculate_order_hash(&order);
    let idempotency_key = format!("{}_{}", caller.to_text(), nonce);
    
    let existing_record = IDEMPOTENCY.with(|idem_ref| {
        idem_ref.borrow().get(&idempotency_key)
    });

    if let Some(record) = existing_record {
        if let Some(existing_order_id) = record.order_id {
            return Ok(existing_order_id);
        }
    }

    let order_id = get_next_order_id();
    let mut final_order = order;
    final_order.id = order_id;

    // Store the order
    ORDERS.with(|orders_ref| {
        orders_ref.borrow_mut().insert(order_id, final_order.clone());
    });

    // Store idempotency record
    let idem_record = IdempotencyRecord {
        user: caller,
        nonce,
        order_hash,
        order_id: Some(order_id),
        created_at: current_time,
    };

    IDEMPOTENCY.with(|idem_ref| {
        idem_ref.borrow_mut().insert(idempotency_key, idem_record);
    });

    Ok(order_id)
}

#[update]
fn create_batch_execution(order_ids: Vec<u64>, execution_chain: ExecutionChain) -> Result<u64, String> {
    if order_ids.is_empty() {
        return Err("Cannot create empty batch".to_string());
    }

    if order_ids.len() > 50 {
        return Err("Batch size too large (max 50 orders)".to_string());
    }

    // Collect orders and validate
    let mut orders = Vec::new();
    ORDERS.with(|orders_ref| {
        let orders_map = orders_ref.borrow();
        for order_id in &order_ids {
            if let Some(order) = orders_map.get(order_id) {
                // Check if order is still valid (not expired)
                if time() > order.deadline {
                    return Err(format!("Order {} has expired", order_id));
                }
                orders.push(order.clone());
            } else {
                return Err(format!("Order {} not found", order_id));
            }
        }
        Ok(())
    })?;

    // Calculate gas savings
    let individual_gas: u64 = orders.iter().map(|o| estimate_individual_gas(&o.target_chain)).sum();
    let batched_gas = estimate_batched_gas(&execution_chain, orders.len());
    let gas_saved = if individual_gas > batched_gas { individual_gas - batched_gas } else { 0 };

    let batch_id = get_next_batch_id();
    let batch = BatchExecution {
        batch_id,
        orders,
        total_gas_saved: gas_saved,
        execution_chain,
        status: BatchStatus::Pending,
        created_at: time(),
        executed_at: None,
        transaction_hash: None,
    };

    BATCHES.with(|batches_ref| {
        batches_ref.borrow_mut().insert(batch_id, batch);
    });

    Ok(batch_id)
}

#[update]
fn execute_batch(batch_id: u64) -> Result<Vec<ExecutionResult>, String> {
    let mut batch = BATCHES.with(|batches_ref| {
        batches_ref.borrow().get(&batch_id)
            .ok_or_else(|| "Batch not found".to_string())
    })?;

    if batch.status != BatchStatus::Pending {
        return Err("Batch is not in pending status".to_string());
    }

    // Update batch status to executing
    batch.status = BatchStatus::Executing;
    BATCHES.with(|batches_ref| {
        batches_ref.borrow_mut().insert(batch_id, batch.clone());
    });

    // Execute orders (simulated for demo)
    let mut results = Vec::new();
    for order in &batch.orders {
        let result = execute_single_order(order);
        results.push(result);
    }

    // Update batch status to completed
    batch.status = BatchStatus::Completed;
    batch.executed_at = Some(time());
    batch.transaction_hash = Some(format!("0x{:x}", batch_id * 1000 + time() % 1000));

    BATCHES.with(|batches_ref| {
        batches_ref.borrow_mut().insert(batch_id, batch);
    });

    Ok(results)
}

fn execute_single_order(order: &SwapOrder) -> ExecutionResult {
    // Simulate order execution
    let success = true; // In real implementation, this would involve actual swap execution
    let output_amount = if success {
        // Simulate 1-3% slippage
        let slippage_factor = 970 + (time() % 30); // 97% to 100%
        Some((order.input_amount * slippage_factor) / 1000)
    } else {
        None
    };

    ExecutionResult {
        order_id: order.id,
        success,
        output_amount,
        gas_used: estimate_individual_gas(&order.target_chain),
        error_message: if success { None } else { Some("Execution failed".to_string()) },
    }
}

fn estimate_individual_gas(chain: &ExecutionChain) -> u64 {
    match chain {
        ExecutionChain::Ethereum => 200000,    // ~200k gas per swap
        ExecutionChain::Arbitrum => 100000,    // ~100k gas per swap
        ExecutionChain::Polygon => 120000,     // ~120k gas per swap
        ExecutionChain::Optimism => 110000,    // ~110k gas per swap
        ExecutionChain::Solana => 10000,       // ~10k compute units per swap
        ExecutionChain::ICP => 2000,           // ~2k cycles per swap
        ExecutionChain::Bitcoin => 500,        // ~500 bytes per transaction
    }
}

fn estimate_batched_gas(chain: &ExecutionChain, order_count: usize) -> u64 {
    let base_gas = match chain {
        ExecutionChain::Ethereum => 100000,    // Base transaction cost
        ExecutionChain::Arbitrum => 50000,
        ExecutionChain::Polygon => 60000,
        ExecutionChain::Optimism => 55000,
        ExecutionChain::Solana => 5000,
        ExecutionChain::ICP => 1000,
        ExecutionChain::Bitcoin => 250,
    };

    let per_order_gas = match chain {
        ExecutionChain::Ethereum => 80000,     // Reduced per-order cost in batch
        ExecutionChain::Arbitrum => 40000,
        ExecutionChain::Polygon => 50000,
        ExecutionChain::Optimism => 45000,
        ExecutionChain::Solana => 4000,
        ExecutionChain::ICP => 800,
        ExecutionChain::Bitcoin => 200,
    };

    base_gas + (per_order_gas * order_count as u64)
}

// Query functions
#[query]
fn get_order(order_id: u64) -> Result<SwapOrder, String> {
    ORDERS.with(|orders_ref| {
        orders_ref.borrow().get(&order_id)
            .ok_or_else(|| "Order not found".to_string())
    })
}

#[query]
fn get_batch(batch_id: u64) -> Result<BatchExecution, String> {
    BATCHES.with(|batches_ref| {
        batches_ref.borrow().get(&batch_id)
            .ok_or_else(|| "Batch not found".to_string())
    })
}

#[query]
fn get_user_orders(user: Principal) -> Vec<SwapOrder> {
    ORDERS.with(|orders_ref| {
        orders_ref.borrow().iter()
            .filter_map(|(_, order)| {
                if order.user == user {
                    Some(order.clone())
                } else {
                    None
                }
            })
            .collect()
    })
}

#[query]
fn get_pending_orders() -> Vec<SwapOrder> {
    ORDERS.with(|orders_ref| {
        orders_ref.borrow().iter()
            .filter_map(|(_, order)| {
                if time() <= order.deadline {
                    Some(order.clone())
                } else {
                    None
                }
            })
            .collect()
    })
}

#[query]
fn calculate_fee_comparison(
    order_count: u64,
    target_chain: ExecutionChain,
) -> FeeComparison {
    let individual_cost = estimate_individual_gas(&target_chain) * order_count;
    let batched_cost = estimate_batched_gas(&target_chain, order_count as usize);
    let icp_cost = 2000 * order_count; // Much lower ICP execution cost

    let savings_vs_individual = if individual_cost > batched_cost {
        individual_cost - batched_cost
    } else {
        0
    };

    let savings_vs_native = if individual_cost > icp_cost {
        individual_cost - icp_cost
    } else {
        0
    };

    let efficiency_score = if individual_cost > 0 {
        ((savings_vs_native * 100) / individual_cost).min(100) as u8
    } else {
        0
    };

    FeeComparison {
        individual_execution_cost: individual_cost,
        batched_execution_cost: batched_cost,
        icp_execution_cost: icp_cost,
        savings_vs_individual,
        savings_vs_native,
        efficiency_score,
    }
}

#[query]
fn get_optimal_batch_size(target_chain: ExecutionChain) -> u8 {
    // Calculate optimal batch size based on gas efficiency
    match target_chain {
        ExecutionChain::Ethereum => 10,    // Optimal for Ethereum gas costs
        ExecutionChain::Arbitrum => 15,    // Can handle larger batches efficiently
        ExecutionChain::Polygon => 12,
        ExecutionChain::Optimism => 13,
        ExecutionChain::Solana => 25,      // Very efficient for large batches
        ExecutionChain::ICP => 50,         // Can handle very large batches
        ExecutionChain::Bitcoin => 5,      // Limited by transaction size
    }
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to the Swap Execution Layer.", name)
}