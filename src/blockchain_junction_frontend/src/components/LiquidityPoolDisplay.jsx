import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
  Activity
} from 'lucide-react';
import GlassCard from './GlassCard';

const LiquidityPoolDisplay = () => {
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState('All');
  const [sortBy, setSortBy] = useState('liquidity');

  const chains = ['All', 'Ethereum', 'Arbitrum', 'Polygon', 'Solana', 'ICP'];

  const mockPools = [
    {
      id: 1,
      pair: 'ETH/USDC',
      chain: 'Ethereum',
      dex: 'Uniswap V3',
      liquidity: 125000000,
      volume24h: 45000000,
      fees24h: 135000,
      apr: 12.5,
      feeRate: 0.3,
      priceChange24h: 2.3,
      reserveA: 50000,
      reserveB: 120000000,
      address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
    },
    {
      id: 2,
      pair: 'ETH/USDC',
      chain: 'Arbitrum',
      dex: 'SushiSwap',
      liquidity: 65000000,
      volume24h: 22000000,
      fees24h: 55000,
      apr: 8.7,
      feeRate: 0.25,
      priceChange24h: -1.2,
      reserveA: 25000,
      reserveB: 60000000,
      address: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443'
    },
    {
      id: 3,
      pair: 'SOL/USDC',
      chain: 'Solana',
      dex: 'Serum',
      liquidity: 80000000,
      volume24h: 35000000,
      fees24h: 70000,
      apr: 15.2,
      feeRate: 0.2,
      priceChange24h: 5.8,
      reserveA: 800000,
      reserveB: 80000000,
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    },
    {
      id: 4,
      pair: 'MATIC/USDC',
      chain: 'Polygon',
      dex: 'QuickSwap',
      liquidity: 35000000,
      volume24h: 12000000,
      fees24h: 24000,
      apr: 9.8,
      feeRate: 0.2,
      priceChange24h: 1.5,
      reserveA: 45000000,
      reserveB: 35000000,
      address: '0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827'
    },
    {
      id: 5,
      pair: 'ICP/USDC',
      chain: 'ICP',
      dex: 'ICPSwap',
      liquidity: 15000000,
      volume24h: 5000000,
      fees24h: 10000,
      apr: 18.5,
      feeRate: 0.2,
      priceChange24h: 3.2,
      reserveA: 2500000,
      reserveB: 15000000,
      address: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
    }
  ];

  useEffect(() => {
    loadPools();
  }, []);

  useEffect(() => {
    filterAndSortPools();
  }, [pools, searchTerm, selectedChain, sortBy]);

  const loadPools = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPools(mockPools);
      setIsLoading(false);
    }, 1000);
  };

  const filterAndSortPools = () => {
    let filtered = pools.filter(pool => {
      const matchesSearch = pool.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pool.dex.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChain = selectedChain === 'All' || pool.chain === selectedChain;
      return matchesSearch && matchesChain;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'liquidity':
          return b.liquidity - a.liquidity;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'apr':
          return b.apr - a.apr;
        case 'fees':
          return b.fees24h - a.fees24h;
        default:
          return 0;
      }
    });

    setFilteredPools(filtered);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getChainColor = (chain) => {
    const colors = {
      'Ethereum': 'text-blue-400',
      'Arbitrum': 'text-cyan-400',
      'Polygon': 'text-purple-400',
      'Solana': 'text-green-400',
      'ICP': 'text-orange-400'
    };
    return colors[chain] || 'text-slate-400';
  };

  const PoolCard = ({ pool }) => (
    <motion.div
      className="p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {pool.pair.split('/')[0][0]}{pool.pair.split('/')[1][0]}
          </div>
          <div>
            <h3 className="font-semibold text-white">{pool.pair}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${getChainColor(pool.chain)}`}>{pool.chain}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{pool.dex}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white">{pool.feeRate}%</p>
          <p className="text-xs text-slate-400">Fee Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400">Total Liquidity</p>
          <p className="text-sm font-medium text-white">{formatNumber(pool.liquidity)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">24h Volume</p>
          <p className="text-sm font-medium text-white">{formatNumber(pool.volume24h)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">24h Fees</p>
          <p className="text-sm font-medium text-white">{formatNumber(pool.fees24h)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">APR</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-emerald-400">{pool.apr}%</p>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1">
          <span className={`text-xs ${pool.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pool.priceChange24h >= 0 ? '+' : ''}{pool.priceChange24h}%
          </span>
          <span className="text-xs text-slate-400">24h</span>
        </div>
        <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          <ExternalLink className="w-3 h-3" />
          View Pool
        </button>
      </div>
    </motion.div>
  );

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-indigo-400" />
          <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
            Liquidity Pools
          </h2>
          <span className="neu text-xs px-2 py-0.5 rounded-full text-slate-300 bg-white/10 border border-white/20">
            Cross-Chain
          </span>
        </div>
        <motion.button
          onClick={loadPools}
          className="neu text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 hover:scale-105 transition-all bg-white/10 border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="w-full px-3 py-2 pr-8 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
          >
            {chains.map(chain => (
              <option key={chain} value={chain} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>
                {chain}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 pr-8 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
          >
            <option value="liquidity" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Sort by Liquidity</option>
            <option value="volume" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Sort by Volume</option>
            <option value="apr" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Sort by APR</option>
            <option value="fees" style={{backgroundColor: '#1e293b', color: '#ffffff'}}>Sort by Fees</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Activity className="w-4 h-4" />
          <span>{filteredPools.length} pools</span>
        </div>
      </div>

      {/* Pool Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-slate-400">Total Liquidity</p>
          <p className="text-lg font-bold text-white">
            {formatNumber(filteredPools.reduce((sum, pool) => sum + pool.liquidity, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-slate-400">24h Volume</p>
          <p className="text-lg font-bold text-white">
            {formatNumber(filteredPools.reduce((sum, pool) => sum + pool.volume24h, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-slate-400">24h Fees</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatNumber(filteredPools.reduce((sum, pool) => sum + pool.fees24h, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-slate-400">Avg APR</p>
          <p className="text-lg font-bold text-emerald-400">
            {filteredPools.length > 0 ? 
              (filteredPools.reduce((sum, pool) => sum + pool.apr, 0) / filteredPools.length).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Pools Grid */}
      <AnimatePresence>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <motion.div
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
            {filteredPools.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No pools found matching your criteria</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default LiquidityPoolDisplay;