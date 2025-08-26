import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Route, 
  ArrowRight, 
  Zap, 
  Clock, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import GlassCard from './GlassCard';
import { useAuth } from '../hooks/useAuth';

const BestRouteFinder = () => {
  const { isAuthenticated, getActor, callCanister } = useAuth();
  
  const [swapForm, setSwapForm] = useState({
    inputToken: 'ETH',
    outputToken: 'USDC',
    amount: '',
    maxHops: 3
  });
  
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [error, setError] = useState(null);

  const supportedTokens = [
    { symbol: 'ETH', name: 'Ethereum', chains: ['Ethereum', 'Arbitrum', 'Optimism'] },
    { symbol: 'USDC', name: 'USD Coin', chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Solana'] },
    { symbol: 'BTC', name: 'Bitcoin', chains: ['Bitcoin', 'Ethereum'] },
    { symbol: 'SOL', name: 'Solana', chains: ['Solana'] },
    { symbol: 'ICP', name: 'Internet Computer', chains: ['ICP'] }
  ];

  const mockRoutes = [
    {
      id: 1,
      path: ['Ethereum', 'Arbitrum'],
      inputAmount: swapForm.amount || '1000',
      outputAmount: '2485.32',
      priceImpact: '0.12%',
      totalFee: '15.50',
      gasEstimate: '0.008 ETH',
      timeEstimate: '2-5 min',
      confidence: 95,
      dexes: ['Uniswap V3', 'SushiSwap'],
      savings: '65%'
    },
    {
      id: 2,
      path: ['Ethereum'],
      inputAmount: swapForm.amount || '1000',
      outputAmount: '2478.91',
      priceImpact: '0.18%',
      totalFee: '22.30',
      gasEstimate: '0.012 ETH',
      timeEstimate: '1-3 min',
      confidence: 88,
      dexes: ['Uniswap V3'],
      savings: '45%'
    },
    {
      id: 3,
      path: ['Polygon', 'Ethereum'],
      inputAmount: swapForm.amount || '1000',
      outputAmount: '2491.15',
      priceImpact: '0.08%',
      totalFee: '8.75',
      gasEstimate: '0.003 ETH',
      timeEstimate: '5-8 min',
      confidence: 92,
      dexes: ['QuickSwap', 'Uniswap V3'],
      savings: '78%'
    }
  ];

  const findRoutes = async () => {
    if (!swapForm.amount || parseFloat(swapForm.amount) <= 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (!isAuthenticated) {
        // Use mock data when not authenticated
        setTimeout(() => {
          setRoutes(mockRoutes);
          setSelectedRoute(mockRoutes[0]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Call the liquidity_aggregator canister to find the best route
      // Use 1e8 instead of 1e18 to avoid nat64 overflow (nat64 max: ~18 quintillion)
      const inputAmountNat = Math.floor(parseFloat(swapForm.amount) * 1e8);
      
      console.log('Calling find_best_route with:', {
        inputToken: swapForm.inputToken,
        outputToken: swapForm.outputToken,
        inputAmount: inputAmountNat,
        maxHops: swapForm.maxHops
      });
      
      const result = await callCanister(
        'liquidityAggregator', 
        'find_best_route', 
        [swapForm.inputToken, swapForm.outputToken, inputAmountNat, swapForm.maxHops]
      );
      
      console.log('Route result:', result);
      
      if (result && result.Ok) {
        const quote = result.Ok;
        const route = {
          id: 1,
          path: ['Ethereum'], // Simplified - in real implementation, extract from quote.route
          inputAmount: swapForm.amount,
          outputAmount: (Number(quote.route.expected_output) / 1e6).toFixed(2), // Assuming USDC has 6 decimals
          priceImpact: (Number(quote.route.price_impact) / 100).toFixed(2) + '%',
          totalFee: (Number(quote.route.total_fee) / 1e6).toFixed(2),
          gasEstimate: (Number(quote.route.estimated_gas) / 1e18).toFixed(6) + ' ETH',
          timeEstimate: Math.floor(Number(quote.total_time_estimate) / 60) + '-' + Math.ceil(Number(quote.total_time_estimate) / 60 + 2) + ' min',
          confidence: Number(quote.confidence_score),
          dexes: ['Uniswap V3'], // Simplified - extract from quote.route.hops
          savings: '65%' // Calculate from quote data
        };
        
        setRoutes([route]);
        setSelectedRoute(route);
      } else {
        // Fallback to mock data if canister call fails
        console.warn('Canister call failed, using mock data:', result?.Err);
        setError(result?.Err || 'Failed to find routes');
        setRoutes(mockRoutes);
        setSelectedRoute(mockRoutes[0]);
      }
    } catch (err) {
      console.error('Error finding routes:', err);
      setError(err.message || 'Failed to connect to liquidity aggregator');
      
      // Fallback to mock data
      setRoutes(mockRoutes);
      setSelectedRoute(mockRoutes[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapFormChange = (field, value) => {
    setSwapForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const RouteCard = ({ route, isSelected, onClick }) => (
    <motion.div
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected 
          ? 'border-indigo-400 bg-indigo-500/10' 
          : 'border-white/20 bg-white/5 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {route.path.map((chain, index) => (
              <React.Fragment key={chain}>
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
                  {chain}
                </span>
                {index < route.path.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-medium">
            {route.savings} saved
          </span>
          <div className={`w-2 h-2 rounded-full ${
            route.confidence > 90 ? 'bg-emerald-400' : 
            route.confidence > 80 ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs">Output Amount</p>
          <p className="text-white font-medium">{route.outputAmount} USDC</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Price Impact</p>
          <p className="text-white font-medium">{route.priceImpact}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Total Fee</p>
          <p className="text-white font-medium">${route.totalFee}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Time</p>
          <p className="text-white font-medium">{route.timeEstimate}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Via: {route.dexes.join(', ')}
          </span>
          <span className="text-slate-400">
            Confidence: {route.confidence}%
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Route Finder Form */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <Route className="w-5 h-5 text-indigo-400" />
          <h2 className="font-space-grotesk font-semibold text-white tracking-tight">
            Best Route Finder
          </h2>
          <span className="neu text-xs px-2 py-0.5 rounded-full text-slate-300 bg-white/10 border border-white/20">
            Cross-Chain
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">From</label>
            <select
              value={swapForm.inputToken}
              onChange={(e) => handleSwapFormChange('inputToken', e.target.value)}
              className="w-full neu px-3 py-2 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
            >
              {supportedTokens.map(token => (
                <option key={token.symbol} value={token.symbol} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">To</label>
            <select
              value={swapForm.outputToken}
              onChange={(e) => handleSwapFormChange('outputToken', e.target.value)}
              className="w-full neu px-3 py-2 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
            >
              {supportedTokens.map(token => (
                <option key={token.symbol} value={token.symbol} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={swapForm.amount}
              onChange={(e) => handleSwapFormChange('amount', e.target.value)}
              className="w-full neu px-3 py-2 rounded-lg focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">Max Hops</label>
            <select
              value={swapForm.maxHops}
              onChange={(e) => handleSwapFormChange('maxHops', parseInt(e.target.value))}
              className="w-full neu px-3 py-2 rounded-lg appearance-none focus:outline-none text-sm bg-white/10 border border-white/20 text-white backdrop-blur-sm focus:border-indigo-400 transition-colors"
            >
              <option value={1} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>1 Hop</option>
              <option value={2} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>2 Hops</option>
              <option value={3} style={{backgroundColor: '#1e293b', color: '#ffffff'}}>3 Hops</option>
            </select>
          </div>
        </div>

        <motion.button
          onClick={findRoutes}
          disabled={isLoading || !swapForm.amount}
          className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Finding Best Routes...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Find Best Routes
            </>
          )}
        </motion.button>
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}
      </GlassCard>

      {/* Routes Results */}
      <AnimatePresence>
        {routes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Available Routes</h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {showComparison ? 'Hide' : 'Show'} Fee Comparison
              </button>
            </div>

            <div className="grid gap-4">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={selectedRoute?.id === route.id}
                  onClick={() => setSelectedRoute(route)}
                />
              ))}
            </div>

            {selectedRoute && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">Selected Route Details</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">Optimal Route</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <DollarSign className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Best Price</p>
                      <p className="text-sm font-medium text-white">{selectedRoute.outputAmount} USDC</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Est. Time</p>
                      <p className="text-sm font-medium text-white">{selectedRoute.timeEstimate}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <TrendingUp className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Price Impact</p>
                      <p className="text-sm font-medium text-white">{selectedRoute.priceImpact}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Gas Savings</p>
                      <p className="text-sm font-medium text-emerald-400">{selectedRoute.savings}</p>
                    </div>
                  </div>

                  <motion.button
                    className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Execute Swap via ICP
                  </motion.button>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BestRouteFinder;