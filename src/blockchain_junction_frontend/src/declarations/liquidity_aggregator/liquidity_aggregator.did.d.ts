import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CrossChainQuote {
  'total_time_estimate' : bigint,
  'execution_fee_icp' : bigint,
  'execution_fee_native' : bigint,
  'bridge_fee' : bigint,
  'confidence_score' : number,
  'route' : SwapRoute,
}
export interface LiquidityPool {
  'pair' : TokenPair,
  'last_updated' : bigint,
  'reserve_a' : bigint,
  'reserve_b' : bigint,
  'fee_rate' : number,
  'dex_name' : string,
  'pool_address' : string,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : CrossChainQuote } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : [bigint, bigint] } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : [bigint, bigint, bigint] } |
  { 'Err' : string };
export type SupportedChain = { 'ICP' : null } |
  { 'Ethereum' : null } |
  { 'Solana' : null } |
  { 'Bitcoin' : null } |
  { 'Polygon' : null } |
  { 'Optimism' : null } |
  { 'Arbitrum' : null };
export interface SwapHop {
  'input_amount' : bigint,
  'pool' : LiquidityPool,
  'output_amount' : bigint,
}
export interface SwapRoute {
  'input_amount' : bigint,
  'hops' : Array<SwapHop>,
  'total_fee' : bigint,
  'expected_output' : bigint,
  'price_impact' : number,
  'input_token' : string,
  'estimated_gas' : bigint,
  'output_token' : string,
}
export interface TokenPair {
  'token_a' : string,
  'token_b' : string,
  'chain' : SupportedChain,
}
export interface _SERVICE {
  'compare_execution_costs' : ActorMethod<[string, string, bigint], Result_3>,
  'find_best_route' : ActorMethod<[string, string, bigint, number], Result_1>,
  'get_aggregated_liquidity' : ActorMethod<[string, string], Result_2>,
  'get_all_pools' : ActorMethod<[], Array<LiquidityPool>>,
  'get_pools_for_pair' : ActorMethod<[string, string], Array<LiquidityPool>>,
  'greet' : ActorMethod<[string], string>,
  'refresh_liquidity_data' : ActorMethod<[], Result>,
  'update_pool_data' : ActorMethod<[string, bigint, bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
