import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingDown, 
  Zap, 
  Calculator,
  PieChart,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import GlassCard from './GlassCard';

const FeeComparisonWidget = ({ selectedRoute, orderCount = 1 }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    if (selectedRoute) {
      calculateFeeComparison();
    }
  }, [selectedRoute, orderCount]);

  const calculateFeeComparison = () => {
    // Simulate fee calculation based on route and order count
    const baseGasPrice = 20; // 20 gwei
    const ethPrice = 2400; // $2400 per ETH
    
    const fees = {
      ethereum: {
        gasUnits: 200000 * orderCount,
        gasPrice: baseGasPrice,
        totalGas: (200000 * orderCount * baseGasPrice) / 1e9, // ETH
        usdCost: ((200000 * orderCount * baseGasPrice) / 1e9) * ethPrice
      },
      arbitrum: {
        gasUnits: 100000 * orderCount,
        gasPrice: 0.1,
        totalGas: (100000 * orderCount * 0.1) / 1e9,
        usdCost: ((100000 * orderCount * 0.1) / 1e9) * ethPrice
      },
      icp: {
        cycles: 2000 * orderCount,
        cyclePrice: 0.000001, // $0.000001 per cycle
        usdCost: 2000 * orderCount * 0.000001
      },
      batched: {
        gasUnits: 100000 + (80000 * orderCount), // Base + per order
        gasPrice: baseGasPrice,
        totalGas: (100000 + (80000 * orderCount)) * baseGasPrice / 1e9,
        usdCost: ((100000 + (80000 * orderCount)) * baseGasPrice / 1e9) * ethPrice
      }
    };

    const savings = {
      icpVsEthereum: fees.ethereum.usdCost - fees.icp.usdCost,
      batchedVsIndividual: fees.ethereum.usdCost - fees.batched.usdCost,
      icpVsBatched: fees.batched.usdCost - fees.icp.usdCost,
      percentageSaved: ((fees.ethereum.usdCost - fees.icp.usdCost) / fees.ethereum.usdCost) * 100
    };

    setComparisonData({ fees, savings });
    setAnimateNumbers(true);
    setTimeout(() => setAnimateNumbers(false), 1000);
  };

  const FeeCard = ({ title, cost, gasInfo, icon: Icon, color, isRecommended = false }) => (
    <motion.div
      className={`relative p-4 rounded-xl border transition-all ${
        isRecommended 
          ? 'border-emerald-400 bg-emerald-500/10' 
          : 'border-white/20 bg-white/5'
      }`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isRecommended && (
        <div className="absolute -top-2 left-4 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
          Recommended
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="font-medium text-white">{title}</span>
        </div>
        {isRecommended && <CheckCircle className="w-4 h-4 text-emerald-400" />}
      </div>

      <div className="space-y-2">
        <div>
          <motion.p 
            className="text-2xl font-bold text-white"
            animate={animateNumbers ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            ${cost.toFixed(4)}
          </motion.p>
          <p className="text-xs text-slate-400">{gasInfo}</p>
        </div>
      </div>
    </motion.div>
  );

  const SavingsCard = ({ title, amount, percentage, icon: Icon }) => (
    <motion.div
      className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">{title}</span>
      </div>
      <motion.p 
        className="text-xl font-bold text-emerald-300"
        animate={animateNumbers ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        ${amount.toFixed(4)}
      </motion.p>
      <p className="text-xs text-emerald-400">{percentage.toFixed(1)}% saved</p>
    </motion.div>
  );

  if (!comparisonData) {
    return (
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Fee Comparison</h3>
        </div>
        <div className="text-center py-8">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400">Select a route to see fee comparison</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">Fee Comparison</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span>Orders: {orderCount}</span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showBreakdown ? 'Hide' : 'Show'} Breakdown
            </button>
          </div>
        </div>

        {/* Fee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FeeCard
            title="Ethereum L1"
            cost={comparisonData.fees.ethereum.usdCost}
            gasInfo={`${comparisonData.fees.ethereum.gasUnits.toLocaleString()} gas @ ${comparisonData.fees.ethereum.gasPrice} gwei`}
            icon={AlertTriangle}
            color="text-red-400"
          />
          
          <FeeCard
            title="Batched Execution"
            cost={comparisonData.fees.batched.usdCost}
            gasInfo={`${comparisonData.fees.batched.gasUnits.toLocaleString()} gas (optimized)`}
            icon={PieChart}
            color="text-yellow-400"
          />
          
          <FeeCard
            title="ICP Execution"
            cost={comparisonData.fees.icp.usdCost}
            gasInfo={`${comparisonData.fees.icp.cycles.toLocaleString()} cycles`}
            icon={Zap}
            color="text-emerald-400"
            isRecommended={true}
          />
        </div>

        {/* Savings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SavingsCard
            title="ICP vs Ethereum"
            amount={comparisonData.savings.icpVsEthereum}
            percentage={comparisonData.savings.percentageSaved}
            icon={TrendingDown}
          />
          
          <SavingsCard
            title="Batching Savings"
            amount={comparisonData.savings.batchedVsIndividual}
            percentage={((comparisonData.savings.batchedVsIndividual / comparisonData.fees.ethereum.usdCost) * 100)}
            icon={PieChart}
          />
        </div>

        {/* Efficiency Indicator */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-400">Efficiency Score</span>
            <span className="text-lg font-bold text-indigo-300">
              {Math.min(100, Math.round(comparisonData.savings.percentageSaved))}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, comparisonData.savings.percentageSaved)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Based on gas savings and execution efficiency
          </p>
        </div>

        {/* Detailed Breakdown */}
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <h4 className="font-medium text-white mb-4">Detailed Breakdown</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-slate-400 text-xs">Ethereum Gas</p>
                    <p className="text-white font-medium">{comparisonData.fees.ethereum.totalGas.toFixed(6)} ETH</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-slate-400 text-xs">Batched Gas</p>
                    <p className="text-white font-medium">{comparisonData.fees.batched.totalGas.toFixed(6)} ETH</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-slate-400 text-xs">ICP Cycles</p>
                    <p className="text-white font-medium">{comparisonData.fees.icp.cycles.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-slate-400 text-xs">Total Saved</p>
                    <p className="text-emerald-400 font-medium">${comparisonData.savings.icpVsEthereum.toFixed(4)}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-1">Why ICP is Cheaper</p>
                      <p className="text-xs text-slate-300">
                        ICP's reverse gas model and efficient execution environment allows for 
                        significantly lower transaction costs compared to Ethereum L1, while 
                        maintaining security through Chain-Key Cryptography.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default FeeComparisonWidget;