# Blockchain Junction Backend

A Rust-based canister for the Internet Computer Protocol (ICP) that enables cross-chain asset swapping functionality. This backend provides a decentralized exchange mechanism for assets across different blockchain networks, starting with ICP and Bitcoin.

## Overview

The Blockchain Junction Backend is a smart contract (canister) that facilitates cross-chain asset swaps through an escrow-based system. Users can deposit assets, create swap requests, and execute trades with other users in a trustless manner.

## Features

- **Asset Management**: Deposit and withdraw assets across supported chains
- **Cross-Chain Swaps**: Create and execute swap requests between different blockchain assets
- **Escrow System**: Secure asset holding during swap negotiations
- **Bitcoin Integration**: Generate Bitcoin deposit addresses for users
- **Balance Tracking**: Query user balances across different assets
- **Stable Storage**: Persistent data storage using IC stable structures

## Supported Chains

- **ICP (Internet Computer Protocol)**: Native support for ICP tokens
- **Bitcoin**: Integration for Bitcoin transactions (simulated in current implementation)

## Architecture

### Core Data Structures

#### Asset
```rust
pub struct Asset {
    chain: Chain,        // Source blockchain (ICP, Bitcoin)
    symbol: String,      // Asset symbol (e.g., "ICP", "BTC")
    amount: u64,         // Amount in smallest unit
}
```

#### SwapRequest
```rust
pub struct SwapRequest {
    id: u64,                    // Unique swap identifier
    user: Principal,            // User creating the swap
    from_asset: Asset,          // Asset being offered
    to_asset_symbol: String,    // Desired asset symbol
    to_chain: Chain,           // Target blockchain
    deadline: u64,             // Expiration timestamp (nanoseconds)
}
```

### Storage

The canister uses IC stable structures for persistent storage:

- **BALANCES**: `StableBTreeMap<Principal, StorableHashMap>` - User asset balances
- **SWAPS**: `StableBTreeMap<u64, SwapRequest>` - Pending swap requests
- **USER_BTC_ADDRESSES**: `StableBTreeMap<Principal, String>` - User Bitcoin addresses

## API Reference

### Update Methods

#### `deposit_asset(asset: Asset) -> Result<(), String>`
Simulates depositing an asset to the user's balance.

**Parameters:**
- `asset`: Asset to deposit (chain, symbol, amount)

**Returns:** Success or error message

#### `create_swap_request(from_asset_symbol: String, from_asset_amount: u64, to_asset_symbol: String, to_chain: Chain, duration_nanos: u64) -> Result<u64, String>`
Creates a new swap request and escrows the from_asset.

**Parameters:**
- `from_asset_symbol`: Symbol of asset to swap from
- `from_asset_amount`: Amount to swap
- `to_asset_symbol`: Symbol of desired asset
- `to_chain`: Target blockchain
- `duration_nanos`: Swap validity duration in nanoseconds

**Returns:** Swap ID or error message

#### `execute_swap(swap_id1: u64, swap_id2: u64) -> Result<(), String>`
Executes a swap between two compatible swap requests.

**Parameters:**
- `swap_id1`: First swap request ID
- `swap_id2`: Second swap request ID

**Returns:** Success or error message

#### `withdraw_asset(asset_symbol: String, amount: u64, target_chain: Chain, target_address: String) -> Result<(), String>`
Withdraws assets to an external blockchain address.

**Parameters:**
- `asset_symbol`: Asset to withdraw
- `amount`: Amount to withdraw
- `target_chain`: Destination blockchain
- `target_address`: Destination address

**Returns:** Success or error message

#### `get_or_generate_user_bitcoin_deposit_address() -> Result<String, String>`
Generates or retrieves a Bitcoin deposit address for the user.

**Returns:** Bitcoin address or error message

### Query Methods

#### `greet(name: String) -> String`
Simple greeting function for testing.

#### `get_user_balance(user: Principal, asset_symbol: String) -> Result<u64, String>`
Retrieves a specific asset balance for a user.

#### `get_all_user_balances(user: Principal) -> Result<HashMap<String, u64>, String>`
Retrieves all asset balances for a user.

#### `get_swap_request(swap_id: u64) -> Result<SwapRequest, String>`
Retrieves details of a specific swap request.

#### `get_all_pending_swaps() -> Vec<SwapRequest>`
Retrieves all pending swap requests.

#### `get_user_bitcoin_deposit_address() -> Result<String, String>`
Retrieves the user's Bitcoin deposit address (query version).

## Dependencies

```toml
[dependencies]
candid = "0.10.6"
ic-cdk = "0.17.2"
ic-cdk-macros = "0.17.2"
ic-cdk-timers = "0.11.0"
serde = "1.0"
ic-stable-structures = "0.6.2"
```

## Development Setup

### Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Rust](https://rustup.rs/) (latest stable version)
- [Cargo](https://doc.rust-lang.org/cargo/) (comes with Rust)

### Building

```bash
# Build the canister
dfx build blockchain_junction_backend

# Or build with Cargo directly
cargo build --target wasm32-unknown-unknown --release
```

### Testing

```bash
# Run unit tests
cargo test

# Deploy to local replica for testing
dfx start --background
dfx deploy blockchain_junction_backend
```

### Deployment

#### Local Development
```bash
# Start local replica
dfx start --background

# Deploy canister
dfx deploy blockchain_junction_backend

# Generate Candid interface
dfx generate blockchain_junction_backend
```

#### Mainnet Deployment
```bash
# Deploy to IC mainnet
dfx deploy --network ic blockchain_junction_backend
```

## Usage Examples

### Depositing Assets
```bash
# Deposit 1000 ICP tokens
dfx canister call blockchain_junction_backend deposit_asset '(record { chain = variant { ICP }; symbol = "ICP"; amount = 1000 })'
```

### Creating a Swap Request
```bash
# Swap 500 ICP for BTC
dfx canister call blockchain_junction_backend create_swap_request '("ICP", 500, "BTC", variant { Bitcoin }, 3600000000000)'
```

### Checking Balances
```bash
# Get all balances for a user
dfx canister call blockchain_junction_backend get_all_user_balances '(principal "your-principal-id")'
```

## Security Considerations

- **Escrow Mechanism**: Assets are held in escrow during swap creation
- **Deadline Enforcement**: Swap requests expire after specified duration
- **Principal Authentication**: All operations require authenticated principals
- **Balance Validation**: Sufficient balance checks before operations

## Limitations & Future Enhancements

### Current Limitations
- Bitcoin integration is simulated (not actual blockchain interaction)
- Manual swap matching (no automated market maker)
- Limited to ICP and Bitcoin chains
- No slippage protection or price oracles

### Planned Enhancements
- Real Bitcoin network integration
- Automated market maker (AMM) functionality
- Additional blockchain support (Ethereum, etc.)
- Price oracle integration
- Advanced order types
- Liquidity pools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Join the Internet Computer developer community
- Check the [IC documentation](https://internetcomputer.org/docs/)