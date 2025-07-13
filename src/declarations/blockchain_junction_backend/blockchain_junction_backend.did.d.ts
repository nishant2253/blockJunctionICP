import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Asset { 'chain' : Chain, 'amount' : bigint, 'symbol' : string }
export type Chain = { 'ICP' : null } |
  { 'Bitcoin' : null };
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : SwapRequest } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : Array<[string, bigint]> } |
  { 'Err' : string };
export interface SwapRequest {
  'id' : bigint,
  'from_asset' : Asset,
  'to_chain' : Chain,
  'user' : Principal,
  'deadline' : bigint,
  'to_asset_symbol' : string,
}
export interface _SERVICE {
  'create_swap_request' : ActorMethod<
    [string, bigint, string, Chain, bigint],
    Result_1
  >,
  'deposit_asset' : ActorMethod<[Asset], Result>,
  'execute_swap' : ActorMethod<[bigint, bigint], Result>,
  'get_all_pending_swaps' : ActorMethod<[], Array<SwapRequest>>,
  'get_all_user_balances' : ActorMethod<[Principal], Result_3>,
  'get_or_generate_user_bitcoin_deposit_address' : ActorMethod<
    [],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'get_swap_request' : ActorMethod<[bigint], Result_2>,
  'get_user_balance' : ActorMethod<[Principal, string], Result_1>,
  'get_user_bitcoin_deposit_address' : ActorMethod<
    [],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'greet' : ActorMethod<[string], string>,
  'withdraw_asset' : ActorMethod<[string, bigint, Chain, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
