import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shuffle, 
  Wallet, 
  PieChart, 
  RefreshCcw, 
  ArrowRight, 
  ChevronDown, 
  Loader, 
  CheckCircle,
  LogIn,
  LogOut,
  Menu,
  X,
  User,
  Copy,
  ExternalLink,
  AlertTriangle,
  Settings,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';
import GlassCard from './components/GlassCard';
import AnimatedBackground from './components/AnimatedBackground';
import ParticleSystem from './components/ParticleSystem';
import BestRouteFinder from './components/BestRouteFinder';
import FeeComparisonWidget from './components/FeeComparisonWidget';
import LiquidityPoolDisplay from './components/LiquidityPoolDisplay';
import { useAuth } from './hooks/useAuth';
import { config } from './config/index.js';

const App = () => {
  // Authentication
  const { isAuthenticated, principal, isLoading: authLoading, login, logout, error: authError, callCanister } = useAuth();
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [depositStatus, setDepositStatus] = useState(null);
  const [balances, setBalances] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [depositForm, setDepositForm] = useState({
    asset: 'ICP',
    amount: '',
    destinationChain: 'Internet Computer'
  });

  // Utility functions
  const formatPrincipal = (principal) => {
    if (!principal) return '';
    return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Event handlers
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login first');
      return;
    }
    
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setDepositStatus('processing');
    
    try {
      // Convert amount to appropriate denomination (using 8 decimals to avoid nat64 overflow)
      // nat64 max value is ~18 quintillion, so 1e8 is safe for most amounts
      const amountNat = Math.floor(parseFloat(depositForm.amount) * 1e8);
      
      // Map destination chain to ExecutionChain variant
      const chainMap = {
        'Internet Computer': 'ICP',
        'Ethereum': 'Ethereum', 
        'Bitcoin': 'Bitcoin',
        'Solana': 'Solana',
        'Polygon': 'Polygon',
        'Arbitrum': 'Arbitrum',
        'Optimism': 'Optimism'
      };
      
      const targetChain = chainMap[depositForm.destinationChain] || 'ICP';
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + 3600; // Current time + 1 hour in seconds
      const nonce = Math.floor(Date.now() / 1000); // Use seconds instead of milliseconds
      
      console.log('Creating swap order for deposit:', {
        inputToken: depositForm.asset,
        outputToken: depositForm.asset, // Same asset, just depositing
        amount: amountNat,
        targetChain: targetChain,
        deadline: deadlineTimestamp,
        nonce: nonce
      });
      
      // Call swap_executor canister to create a deposit order
      const result = await callCanister(
        'swapExecutor',
        'create_swap_order',
        [
          depositForm.asset,     // input_token
          depositForm.asset,     // output_token (same for deposit)
          amountNat,            // input_amount
          amountNat,            // min_output_amount (same for deposit)
          { [targetChain]: null }, // target_chain as proper variant
          deadlineTimestamp,    // deadline (timestamp in seconds)
          nonce                 // nonce (timestamp in seconds)
        ]
      );
      
      console.log('Deposit result:', result);
      
      if (result && result.Ok) {
        setDepositStatus('success');
        console.log('Deposit order created successfully with ID:', result.Ok);
        
        // Clear form
        setDepositForm({
          asset: 'ICP',
          amount: '',
          destinationChain: 'Internet Computer'
        });
        
        // Refresh balances after successful deposit
        setTimeout(() => {
          refreshBalances();
        }, 1000);
        
        setTimeout(() => setDepositStatus(null), 3000);
      } else {
        console.error('Deposit failed:', result?.Err);
        setDepositStatus('error');
        setTimeout(() => setDepositStatus(null), 3000);
      }
    } catch (err) {
      console.error('Error creating deposit order:', err);
      setDepositStatus('error');
      setTimeout(() => setDepositStatus(null), 3000);
    }
  };

  const refreshBalances = async () => {
    if (!isAuthenticated) {
      setBalances([]);
      return;
    }

    // Mock balances - in real app, fetch from canister
    setBalances([
      { symbol: 'ICP', name: 'Internet Computer', amount: '125.0', value: '$550', icon: '🔵' },
      { symbol: 'BTC', name: 'Bitcoin', amount: '0.042', value: '$1,250', icon: '🟠' },
      { symbol: 'ETH', name: 'Ethereum', amount: '0.60', value: '$1,013', icon: '🟣' }
    ]);
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Lightweight Particle System */}
      <ParticleSystem count={15} />
      
      {/* Premium Dreamy Gradient Backdrop */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900" />
      
      {/* Simplified Rotating Orb */}
      <motion.div 
        className="fixed inset-0 -z-10 opacity-15"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400/15 via-blue-500/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Navigation */}
      <header 
        className="fixed top-0 inset-x-0 h-16 flex items-center px-4 sm:px-6 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => setActiveTab('dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle className="w-6 h-6 text-indigo-400" />
            <span className="font-semibold tracking-tight text-white font-space-grotesk text-lg">
              BlockJunction
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 xl:space-x-6 text-sm font-medium flex-1 justify-center">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`nav-button relative transition-all duration-300 px-3 lg:px-4 py-3 whitespace-nowrap bg-transparent border-0 outline-0 focus:outline-0 ${
                activeTab === 'dashboard' 
                  ? 'text-indigo-400 font-semibold bg-indigo-400/10 rounded-lg'
                  : 'text-slate-200 hover:text-white hover:bg-white/5 rounded-lg'
              }`}
            >
              Dashboard
              {activeTab === 'dashboard' && <motion.div layoutId="active-tab-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('swap')}
              className={`nav-button relative transition-all duration-300 px-3 lg:px-4 py-3 whitespace-nowrap bg-transparent border-0 outline-0 focus:outline-0 ${
                activeTab === 'swap' 
                  ? 'text-indigo-400 font-semibold bg-indigo-400/10 rounded-lg'
                  : 'text-slate-200 hover:text-white hover:bg-white/5 rounded-lg'
              }`}
            >
              Cross-Chain Swap
              {activeTab === 'swap' && <motion.div layoutId="active-tab-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('pools')}
              className={`nav-button relative transition-all duration-300 px-3 lg:px-4 py-3 whitespace-nowrap bg-transparent border-0 outline-0 focus:outline-0 ${
                activeTab === 'pools' 
                  ? 'text-indigo-400 font-semibold bg-indigo-400/10 rounded-lg'
                  : 'text-slate-200 hover:text-white hover:bg-white/5 rounded-lg'
              }`}
            >
              Liquidity Pools
              {activeTab === 'pools' && <motion.div layoutId="active-tab-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />}
            </button>
            <button 
              onClick={() => scrollToSection('supported')}
              className="nav-button relative text-slate-200 hover:text-white hover:bg-white/5 transition-all duration-300 px-3 lg:px-4 py-3 whitespace-nowrap bg-transparent border-0 outline-0 focus:outline-0 rounded-lg"
            >
              Networks
            </button>
            <a 
              href={config.urls.docs} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-button relative text-slate-200 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-1 px-3 lg:px-4 py-3 whitespace-nowrap bg-transparent border-0 outline-0 focus:outline-0 rounded-lg"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Authentication Section */}
            <div className="hidden md:flex items-center flex-shrink-0">
              {authLoading ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                  <Loader className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-sm text-slate-300">Connecting...</span>
                </div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Open user menu"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-white font-medium">
                      {formatPrincipal(principal)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* User Menu Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-xs text-slate-400 mb-1">Connected Principal</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-white bg-white/10 px-2 py-1 rounded flex-1 truncate">
                              {principal}
                            </code>
                            <button
                              onClick={() => copyToClipboard(principal)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="Copy Principal"
                              aria-label="Copy principal to clipboard"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Disconnect Wallet
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  Connect Wallet
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Mobile Menu Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-16 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-white/10 md:hidden"
            >
            <motion.div 
              className="p-6 space-y-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {[
                { label: 'Dashboard', tab: 'dashboard' },
                { label: 'Cross-Chain Swap', tab: 'swap' },
                { label: 'Liquidity Pools', tab: 'pools' },
                { label: 'Networks', action: () => scrollToSection('supported') },
              ].map((item, index) => (
                <motion.button 
                  key={index}
                  onClick={() => { 
                    if(item.tab) setActiveTab(item.tab);
                    if(item.action) item.action();
                    setIsMenuOpen(false); 
                  }}
                  className={`block w-full text-left py-3 px-3 rounded-md transition-colors text-base ${
                    activeTab === item.tab ? 'text-indigo-400 bg-indigo-400/10' : 'text-white hover:text-indigo-400 hover:bg-indigo-400/5'
                  }`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Connected</p>
                      <p className="text-sm text-white font-mono">{formatPrincipal(principal)}</p>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-32 pb-24 px-6">
        <h1 className="font-space-grotesk text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
          BlockJunction
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mb-6 text-slate-300">
          The ultimate cross-chain DEX aggregator powered by ICP's execution layer. 
          Find the best routes, minimize fees, and execute swaps across multiple chains.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
            ✨ 90% Lower Fees
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30">
            🔗 Cross-Chain Routing
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/30">
            ⚡ ICP Execution Layer
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={() => setActiveTab('swap')}
            className="cta px-7 py-3 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Swapping <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => scrollToSection('supported')}
            className="px-7 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white backdrop-blur-sm bg-white/10 border border-white/30 hover:border-indigo-400/50 hover:scale-105 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Supported Networks
          </motion.button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-32 pt-8">
        {/* Authentication Error Display */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg"
          >
            <p className="text-red-400 text-sm">Authentication Error: {authError}</p>
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Dashboard Content */}
        {/* Welcome Card */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {isAuthenticated ? <User className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
                {isAuthenticated ? 'Welcome back' : 'Welcome to BlockJunction'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAuthenticated ? 'Wallet connected' : 'Connect your wallet to get started'}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            {isAuthenticated 
              ? 'Ready to bridge your assets? Start by depositing tokens or view your current balances.'
              : 'Connect your Internet Identity wallet to access cross-chain swapping, liquidity pools, and fee savings.'
            }
          </p>
          {!isAuthenticated && (
            <motion.button
              onClick={handleLogin}
              className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Connect Wallet
            </motion.button>
          )}
        </GlassCard>

        {/* Deposit Card */}
        <GlassCard delay={0.2}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
                Deposit Assets
              </h2>
            </div>
            <span className="neu text-xs px-2 py-0.5 rounded-full text-slate-300 bg-white/10 border border-white/20">
              Testnet
            </span>
          </div>

          <form onSubmit={handleDeposit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-300">Asset</label>
              <div className="relative">
                <select
                  value={depositForm.asset}
                  onChange={(e) => setDepositForm({...depositForm, asset: e.target.value})}
                  className="w-full neu px-3 py-2 pr-8 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
                >
                  <option value="ICP" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>ICP</option>
                  <option value="BTC" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>BTC</option>
                  <option value="ETH" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>ETH</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-300">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={depositForm.amount}
                onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                className="w-full neu px-3 py-2 rounded-lg focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
              />
              <p className="text-11 text-slate-500 mt-1">Balance: 0.00</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-300">Destination Chain</label>
              <div className="relative">
                <select
                  value={depositForm.destinationChain}
                  onChange={(e) => setDepositForm({...depositForm, destinationChain: e.target.value})}
                  className="w-full neu px-3 py-2 pr-8 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
                >
                  <option value="Internet Computer" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Internet Computer</option>
                  <option value="Bitcoin" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Bitcoin</option>
                  <option value="Ethereum" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Ethereum</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            
            <motion.button
              type="submit"
              className="cta w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              disabled={depositStatus === 'processing'}
            >
              {depositStatus === 'processing' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Deposit <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {depositStatus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <p className="text-sm text-slate-300 flex items-center gap-2 mb-2">
                  {depositStatus === 'processing' ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 text-indigo-400" />
                      Processing transaction...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Deposit successful
                    </>
                  )}
                </p>
                {depositStatus === 'processing' && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-indigo-400 h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Balances Card */}
        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
                Balances
              </h2>
            </div>
            <motion.button
              onClick={refreshBalances}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 hover:text-white hover:scale-105 transition-all bg-slate-800/60 border border-white/10 hover:border-indigo-400/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Refresh balances"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Refresh
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="not-connected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-sm text-slate-500 py-8 space-y-3"
              >
                <Wallet className="w-8 h-8 text-slate-400" />
                <p>Connect wallet to view balances</p>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs hover:scale-105 transition-all"
                >
                  Connect Now
                </button>
              </motion.div>
            ) : !balances ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center text-sm text-slate-500 py-8"
              >
                Click refresh to load balances
              </motion.div>
            ) : (
              <motion.div
                key="balances"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {balances.map((balance, index) => (
                  <motion.div
                    key={balance.symbol}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{balance.icon}</span>
                      <span className="text-sm text-slate-300">{balance.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">{balance.amount}</p>
                      <p className="text-xs text-slate-500">{balance.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Cross-Chain Swap Hub</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Find the best routes across multiple chains and execute swaps with minimal fees using ICP's execution layer.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BestRouteFinder />
              </div>
              <div>
                <FeeComparisonWidget selectedRoute={selectedRoute} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pools' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Liquidity Aggregation</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Monitor liquidity across multiple DEXes and chains to find the best trading opportunities.
              </p>
            </div>
            
            <LiquidityPoolDisplay />
          </div>
        )}
      </main>

      {/* Divider */}
      <div className="border-t border-white/10 mx-6" />

      {/* Supported Networks */}
      <motion.section 
        id="supported" 
        className="max-w-4xl mx-auto py-20 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-space-grotesk font-semibold tracking-tight text-white mb-10 text-center">
          Supported Networks
        </h2>
        <motion.div 
          className="grid sm:grid-cols-3 grid-cols-2 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { name: 'Internet Computer', icon: '🔵' },
            { name: 'Ethereum', icon: '🟣' },
            { name: 'Bitcoin', icon: '🟠' },
            { name: 'Arbitrum', icon: '🔷' },
            { name: 'Polygon', icon: '🟪' },
            { name: 'Solana', icon: '🟢' }
          ].map((network, index) => (
            <motion.div
              key={network.name}
              variants={itemVariants}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl">{network.icon}</div>
              <span className="text-sm text-slate-300 font-medium">{network.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
};

export default App;