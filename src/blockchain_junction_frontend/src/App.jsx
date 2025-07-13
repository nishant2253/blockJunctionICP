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
  Menu,
  X
} from 'lucide-react';
import GlassCard from './components/GlassCard';
import AnimatedBackground from './components/AnimatedBackground';
import ParticleSystem from './components/ParticleSystem';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [depositStatus, setDepositStatus] = useState(null);
  const [balances, setBalances] = useState(null);
  const [depositForm, setDepositForm] = useState({
    asset: 'ICP',
    amount: '',
    destinationChain: 'Internet Computer'
  });

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositStatus('processing');
    
    // Simulate deposit process
    setTimeout(() => {
      setDepositStatus('success');
      setTimeout(() => setDepositStatus(null), 3000);
    }, 2000);
  };

  const refreshBalances = () => {
    setBalances([
      { symbol: 'ICP', name: 'Internet Computer', amount: '125.0', value: '$550', icon: '🔵' },
      { symbol: 'BTC', name: 'Bitcoin', amount: '0.042', value: '$1,250', icon: '🟠' },
      { symbol: 'ETH', name: 'Ethereum', amount: '0.60', value: '$1,013', icon: '🟣' }
    ]);
  };

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
        className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-6 z-50 backdrop-blur-lg bg-white/5 border-b border-white/10"
      >
        <motion.div className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold tracking-tight text-white font-space-grotesk">
            CrossChain Swap
          </span>
        </motion.div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Dashboard</a>
          <a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Docs</a>
          <a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors">Support</a>
        </nav>
        
        <button className="neu px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 text-slate-300 hover:text-white transition-all backdrop-blur-sm bg-white/10 border border-white/20">
          Login <LogIn className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-32 pb-24 px-6">
        <h1 className="font-space-grotesk text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
          Cross-Chain Asset Swap
        </h1>
        
        <p className="text-lg md:text-xl max-w-xl mb-10 text-slate-300">
          Seamlessly swap assets across multiple blockchain networks with next-gen security and speed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#dashboard"
            className="cta px-7 py-3 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
          >
            Start Swapping <ArrowRight className="w-4 h-4" />
          </a>
          
          <a
            href="#supported"
            className="neu px-7 py-3 rounded-xl text-sm font-medium text-slate-300 backdrop-blur-sm bg-white/10 border border-white/20 hover:scale-105 transition-transform"
          >
            Supported Networks
          </a>
        </div>
      </section>

      {/* Dashboard */}
      <main 
        id="dashboard"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6 pb-32"
      >
        {/* Welcome Card */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              W
            </div>
            <div>
              <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500">Wallet connected</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Ready to bridge your assets? Start by depositing tokens or view your current balances.
          </p>
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
              className="neu text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 hover:scale-105 transition-all bg-white/10 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Refresh
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {!balances ? (
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
            { name: 'Bitcoin', icon: '🟠' },
            { name: 'Ethereum', icon: '🟣' }
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