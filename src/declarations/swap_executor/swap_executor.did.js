export const idlFactory = ({ IDL }) => {
  const ExecutionChain = IDL.Variant({
    'ICP' : IDL.Null,
    'Ethereum' : IDL.Null,
    'Solana' : IDL.Null,
    'Bitcoin' : IDL.Null,
    'Polygon' : IDL.Null,
    'Optimism' : IDL.Null,
    'Arbitrum' : IDL.Null,
  });
  const FeeComparison = IDL.Record({
    'efficiency_score' : IDL.Nat8,
    'individual_execution_cost' : IDL.Nat64,
    'batched_execution_cost' : IDL.Nat64,
    'icp_execution_cost' : IDL.Nat64,
    'savings_vs_individual' : IDL.Nat64,
    'savings_vs_native' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const ExecutionResult = IDL.Record({
    'error_message' : IDL.Opt(IDL.Text),
    'output_amount' : IDL.Opt(IDL.Nat64),
    'success' : IDL.Bool,
    'order_id' : IDL.Nat64,
    'gas_used' : IDL.Nat64,
  });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Vec(ExecutionResult),
    'Err' : IDL.Text,
  });
  const BatchStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'Executing' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const SwapOrder = IDL.Record({
    'id' : IDL.Nat64,
    'input_amount' : IDL.Nat64,
    'min_output_amount' : IDL.Nat64,
    'user' : IDL.Principal,
    'deadline' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'nonce' : IDL.Nat64,
    'target_chain' : ExecutionChain,
    'input_token' : IDL.Text,
    'output_token' : IDL.Text,
  });
  const BatchExecution = IDL.Record({
    'status' : BatchStatus,
    'transaction_hash' : IDL.Opt(IDL.Text),
    'executed_at' : IDL.Opt(IDL.Nat64),
    'orders' : IDL.Vec(SwapOrder),
    'batch_id' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'execution_chain' : ExecutionChain,
    'total_gas_saved' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({ 'Ok' : BatchExecution, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : SwapOrder, 'Err' : IDL.Text });
  return IDL.Service({
    'calculate_fee_comparison' : IDL.Func(
        [IDL.Nat64, ExecutionChain],
        [FeeComparison],
        ['query'],
      ),
    'create_batch_execution' : IDL.Func(
        [IDL.Vec(IDL.Nat64), ExecutionChain],
        [Result],
        [],
      ),
    'create_swap_order' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Nat64,
          IDL.Nat64,
          ExecutionChain,
          IDL.Nat64,
          IDL.Nat64,
        ],
        [Result],
        [],
      ),
    'execute_batch' : IDL.Func([IDL.Nat64], [Result_3], []),
    'get_batch' : IDL.Func([IDL.Nat64], [Result_2], ['query']),
    'get_optimal_batch_size' : IDL.Func(
        [ExecutionChain],
        [IDL.Nat8],
        ['query'],
      ),
    'get_order' : IDL.Func([IDL.Nat64], [Result_1], ['query']),
    'get_pending_orders' : IDL.Func([], [IDL.Vec(SwapOrder)], ['query']),
    'get_user_orders' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(SwapOrder)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
