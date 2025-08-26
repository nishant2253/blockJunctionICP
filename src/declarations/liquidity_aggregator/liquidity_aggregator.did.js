export const idlFactory = ({ IDL }) => {
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Nat64, IDL.Nat64, IDL.Nat64),
    'Err' : IDL.Text,
  });
  const SupportedChain = IDL.Variant({
    'ICP' : IDL.Null,
    'Ethereum' : IDL.Null,
    'Solana' : IDL.Null,
    'Bitcoin' : IDL.Null,
    'Polygon' : IDL.Null,
    'Optimism' : IDL.Null,
    'Arbitrum' : IDL.Null,
  });
  const TokenPair = IDL.Record({
    'token_a' : IDL.Text,
    'token_b' : IDL.Text,
    'chain' : SupportedChain,
  });
  const LiquidityPool = IDL.Record({
    'pair' : TokenPair,
    'last_updated' : IDL.Nat64,
    'reserve_a' : IDL.Nat64,
    'reserve_b' : IDL.Nat64,
    'fee_rate' : IDL.Nat32,
    'dex_name' : IDL.Text,
    'pool_address' : IDL.Text,
  });
  const SwapHop = IDL.Record({
    'input_amount' : IDL.Nat64,
    'pool' : LiquidityPool,
    'output_amount' : IDL.Nat64,
  });
  const SwapRoute = IDL.Record({
    'input_amount' : IDL.Nat64,
    'hops' : IDL.Vec(SwapHop),
    'total_fee' : IDL.Nat64,
    'expected_output' : IDL.Nat64,
    'price_impact' : IDL.Nat32,
    'input_token' : IDL.Text,
    'estimated_gas' : IDL.Nat64,
    'output_token' : IDL.Text,
  });
  const CrossChainQuote = IDL.Record({
    'total_time_estimate' : IDL.Nat64,
    'execution_fee_icp' : IDL.Nat64,
    'execution_fee_native' : IDL.Nat64,
    'bridge_fee' : IDL.Nat64,
    'confidence_score' : IDL.Nat8,
    'route' : SwapRoute,
  });
  const Result_1 = IDL.Variant({ 'Ok' : CrossChainQuote, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Nat64, IDL.Nat64),
    'Err' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'compare_execution_costs' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64],
        [Result_3],
        ['query'],
      ),
    'find_best_route' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64, IDL.Nat8],
        [Result_1],
        ['query'],
      ),
    'get_aggregated_liquidity' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result_2],
        ['query'],
      ),
    'get_all_pools' : IDL.Func([], [IDL.Vec(LiquidityPool)], ['query']),
    'get_pools_for_pair' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(LiquidityPool)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'refresh_liquidity_data' : IDL.Func([], [Result], []),
    'update_pool_data' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Nat64],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
