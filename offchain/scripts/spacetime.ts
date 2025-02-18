import {
  Address,
  Data,
  SpendingValidator,
  applyParamsToScript
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  SpacetimeSpacetimeSpend,
  AsteriaTypesAssetClass,
  AsteriaTypesSpeed,
} from "../../onchain/src/plutus.ts";

function buildSpacetimeValidator(
  pellet_validator_address: Address,
  asteria_validator_address: Address,
  admin_token: AsteriaTypesAssetClass,
  max_speed: AsteriaTypesSpeed,
  max_ship_fuel: bigint,
  fuel_per_step: bigint,
): SpendingValidator {
  const validator = new SpacetimeSpacetimeSpend(
      pellet_validator_address,
      asteria_validator_address,
      admin_token,
      max_speed,
      max_ship_fuel,
      fuel_per_step,
  );

  return validator
}

export { buildSpacetimeValidator };
