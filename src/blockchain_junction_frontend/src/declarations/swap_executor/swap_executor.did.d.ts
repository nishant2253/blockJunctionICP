import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BatchExecution {
  'status' : BatchStatus,
  'transaction_hash' : [] | [string],
  'executed_at' : [] | [bigint],
  'orders' : Array<SwapOrder>,
  'batch_id' : bigint,
  'created_at' : bigint,
  'execution_chain' : ExecutionChain,
  'total_gas_saved' : bigint,
}
export type BatchStatus = { 'Failed' : null } |
  { 'Executing' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export type ExecutionChain = { 'ICP' : null } |
  { 'Ethereum' : null } |
  { 'Solana' : null } |
  { 'Bitcoin' : null } |
  { 'Polygon' : null } |
  { 'Optimism' : null } |
  { 'Arbitrum' : null };
export interface ExecutionResult {
  'error_message' : [] | [string],
  'output_amount' : [] | [bigint],
  'success' : boolean,
  'order_id' : bigint,
  'gas_used' : bigint,
}
export interface FeeComparison {
  'efficiency_score' : number,
  'individual_execution_cost' : bigint,
  'batched_execution_cost' : bigint,
  'icp_execution_cost' : bigint,
  'savings_vs_individual' : bigint,
  'savings_vs_native' : bigint,
}
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : SwapOrder } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : BatchExecution } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : Array<ExecutionResult> } |
  { 'Err' : string };
export interface SwapOrder {
  'id' : bigint,
  'input_amount' : bigint,
  'min_output_amount' : bigint,
  'user' : Principal,
  'deadline' : bigint,
  'created_at' : bigint,
  'nonce' : bigint,
  'target_chain' : ExecutionChain,
  'input_token' : string,
  'output_token' : string,
}
export interface _SERVICE {
  'calculate_fee_comparison' : ActorMethod<
    [bigint, ExecutionChain],
    FeeComparison
  >,
  'create_batch_execution' : ActorMethod<
    [BigUint64Array | bigint[], ExecutionChain],
    Result
  >,
  'create_swap_order' : ActorMethod<
    [string, string, bigint, bigint, ExecutionChain, bigint, bigint],
    Result
  >,
  'execute_batch' : ActorMethod<[bigint], Result_3>,
  'get_batch' : ActorMethod<[bigint], Result_2>,
  'get_optimal_batch_size' : ActorMethod<[ExecutionChain], number>,
  'get_order' : ActorMethod<[bigint], Result_1>,
  'get_pending_orders' : ActorMethod<[], Array<SwapOrder>>,
  'get_user_orders' : ActorMethod<[Principal], Array<SwapOrder>>,
  'greet' : ActorMethod<[string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
