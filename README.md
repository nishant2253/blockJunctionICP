# Blockchain Junction

A cross-chain asset swap platform built on the Internet Computer Protocol (ICP) that enables seamless asset transfers between different blockchain networks.

## Overview

Blockchain Junction is a decentralized application (dApp) that facilitates cross-chain asset swaps through a sophisticated backend canister written in Rust and a modern React frontend. The platform supports multiple blockchain networks including Internet Computer, Bitcoin, and Ethereum, providing users with a unified interface for managing cross-chain assets.

## Key Features

- **Cross-Chain Asset Swaps**: Seamlessly swap assets between different blockchain networks
- **Multi-Chain Support**: Currently supports ICP, Bitcoin, and Ethereum networks
- **Secure Authentication**: Internet Identity integration for secure user authentication
- **Real-time Balance Management**: Track asset balances across multiple chains
- **Modern UI/UX**: Beautiful, responsive interface with glass morphism design
- **Decentralized Architecture**: Fully decentralized backend running on ICP canisters

## Project Structure

This project consists of two main components:

1. **Backend Canister** (`src/blockchain_junction_backend/`): Rust-based smart contract handling cross-chain logic
2. **Frontend Application** (`src/blockchain_junction_frontend/`): React-based web interface

## Recent Updates

- **UI/UX Overhaul**: Complete redesign with modern glass morphism effects and animations
- **JSX Syntax Fixes**: Resolved all React compilation errors and mismatched tags
- **Enhanced Styling**: Added comprehensive CSS utilities and responsive design
- **Component Architecture**: Modular component structure with reusable glass cards
- **Animation System**: Integrated Framer Motion for smooth animations and transitions

## Getting Started Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **DFX** (DFINITY Canister SDK) - [Installation Guide](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- **Git**

### Step 1: Install Dependencies

First, install dependencies in both the project root and frontend directory:

```bash
# Install dependencies in project root
npm install

# Navigate to frontend directory and install dependencies
cd src/blockchain_junction_frontend/
npm install

# Return to project root
cd ../..
```

**Purpose**: This installs all necessary packages for both the backend canister development and the React frontend application.

### Step 2: Start Internet Computer Local Network

#### For Regular Development (Background Mode)
```bash
dfx start --background
```
**Purpose**: Starts the local Internet Computer replica in the background, allowing you to continue using the terminal while the network runs.

#### For Fresh Start (Clean State)
```bash
dfx start --clean
```
**Purpose**: Starts the local network with a clean state, removing all previous canister data and deployments. Use this when you want to reset everything.

### Step 3: Identity Management

#### Check Available Identities
```bash
dfx identity list
```
**Purpose**: Lists all available DFX identities on your system. Identities are used to manage different developer accounts and permissions.

#### Create New Identity (Optional)
```bash
dfx identity new <identity-name>
```
**Purpose**: Creates a new identity for development. Replace `<identity-name>` with your desired name (e.g., `my-dev-identity`).

#### Check Current Identity
```bash
dfx identity whoami
```
**Purpose**: Shows which identity is currently active. This identity will be used for deployments and canister calls.

#### Switch Identity (Optional)
```bash
dfx identity use <your-identity-name>
# or use default
dfx identity use default
```
**Purpose**: Switches to a specific identity. Use "default" for the default identity or specify your custom identity name.

### Step 4: Local Deployment

#### Deploy to Local Network
```bash
dfx deploy
```
**Purpose**: Compiles and deploys both the backend canister (Rust) and frontend canister to your local Internet Computer network. This makes your application accessible locally.

#### Access Your Application
After successful deployment, you'll see output similar to:
```
URLs:
  Frontend canister via browser
    blockchain_junction_frontend: http://127.0.0.1:4943/?canisterId=<canister-id>
  Backend canister via Candid interface
    blockchain_junction_backend: http://127.0.0.1:4943/_/candid?id=<canister-id>
```

### Step 5: Mainnet Deployment (Production)

**Warning**: Mainnet deployment costs cycles (ICP tokens). Ensure you have sufficient cycles before proceeding.

#### Prepare for Mainnet
```bash
# Check available identities
dfx identity list

# Create production identity (recommended)
dfx identity new production

# Check current identity
dfx identity whoami

# Switch to production identity
dfx identity use production
```

#### Get Cycles for Deployment
```bash
# Redeem faucet coupon (if you have one)
dfx cycles redeem-faucet-coupon <coupon-code> --ic
```
**Purpose**: Redeems a cycles faucet coupon to get free cycles for deployment. Replace `<coupon-code>` with your actual coupon code.

#### Check Cycles Balance
```bash
dfx cycles balance --ic
```
**Purpose**: Displays your current cycles balance on the mainnet. You need cycles to deploy and run canisters on the Internet Computer.

#### Deploy to Mainnet
```bash
dfx deploy --ic
```
**Purpose**: Deploys your application to the Internet Computer mainnet. This makes your application publicly accessible on the decentralized web.

### Step 6: Development Workflow

#### Start Frontend Development Server
```bash
cd src/blockchain_junction_frontend/
npm run dev
```
**Purpose**: Starts the Vite development server for hot-reloading during frontend development.

#### Build Frontend for Production
```bash
cd src/blockchain_junction_frontend/
npm run build
```
**Purpose**: Creates an optimized production build of the frontend application.

### Common Commands Reference

| Command | Purpose |
|---------|---------|
| `dfx start --background` | Start local IC network in background |
| `dfx start --clean` | Start with clean state |
| `dfx stop` | Stop local IC network |
| `dfx deploy` | Deploy to local network |
| `dfx deploy --ic` | Deploy to mainnet |
| `dfx canister status --all` | Check status of all canisters |
| `dfx cycles balance` | Check cycles balance (local) |
| `dfx cycles balance --ic` | Check cycles balance (mainnet) |

### Troubleshooting

#### Common Issues:

1. **"dfx command not found"**
   - Install DFX: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`

2. **"Port already in use"**
   - Stop existing DFX: `dfx stop`
   - Then restart: `dfx start --background`

3. **"Insufficient cycles"**
   - Get cycles from faucet or purchase ICP tokens
   - Convert ICP to cycles: `dfx cycles convert <amount>`

4. **Frontend not loading**
   - Ensure both backend and frontend are deployed
   - Check canister URLs in deployment output
   - Verify local network is running

### Next Steps

After successful deployment:
1. Test the cross-chain swap functionality
2. Explore the Candid interface for backend testing
3. Customize the frontend for your specific needs
4. Add additional blockchain integrations
5. Implement comprehensive testing

For more detailed information, refer to the [Internet Computer Documentation](https://internetcomputer.org/docs/).

## Running the Project

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

## Learn More

To learn more before you start working with `blockchain_junction`, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid Introduction](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd blockchain_junction/
dfx help
dfx canister --help
```