import {
  Address,
  Data,
  SpendingValidator,
  applyParamsToScript,
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  AsteriaAsteriaSpend,
  AsteriaTypesAssetClass
} from "../../onchain/src/plutus.ts";

function buildAsteriaValidator(
  pellet_validator_address: Address,
  admin_token: AsteriaTypesAssetClass,
  ship_mint_lovelace_fee: bigint,
  max_asteria_mining: bigint,
  initial_fuel: bigint,
  min_asteria_distance: bigint,
): SpendingValidator {
  const validator = new AsteriaAsteriaSpend(
    pellet_validator_address,
    admin_token,
    ship_mint_lovelace_fee,
    max_asteria_mining,
    initial_fuel,
    min_asteria_distance,
  );

  return validator
}

export { buildAsteriaValidator };
