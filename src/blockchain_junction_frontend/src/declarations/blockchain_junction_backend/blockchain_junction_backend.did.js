export const idlFactory = ({ IDL }) => {
  const Chain = IDL.Variant({ 'ICP' : IDL.Null, 'Bitcoin' : IDL.Null });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const Asset = IDL.Record({
    'chain' : Chain,
    'amount' : IDL.Nat64,
    'symbol' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const SwapRequest = IDL.Record({
    'id' : IDL.Nat64,
    'from_asset' : Asset,
    'to_chain' : Chain,
    'user' : IDL.Principal,
    'deadline' : IDL.Nat64,
    'to_asset_symbol' : IDL.Text,
  });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'Err' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : SwapRequest, 'Err' : IDL.Text });
  return IDL.Service({
    'create_swap_request' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Text, Chain, IDL.Nat64],
        [Result_1],
        [],
      ),
    'deposit_asset' : IDL.Func([Asset], [Result], []),
    'execute_swap' : IDL.Func([IDL.Nat64, IDL.Nat64], [Result], []),
    'get_all_pending_swaps' : IDL.Func([], [IDL.Vec(SwapRequest)], ['query']),
    'get_all_user_balances' : IDL.Func([IDL.Principal], [Result_3], ['query']),
    'get_or_generate_user_bitcoin_deposit_address' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_swap_request' : IDL.Func([IDL.Nat64], [Result_2], ['query']),
    'get_user_balance' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [Result_1],
        ['query'],
      ),
    'get_user_bitcoin_deposit_address' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'withdraw_asset' : IDL.Func(
        [IDL.Text, IDL.Nat64, Chain, IDL.Text],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
