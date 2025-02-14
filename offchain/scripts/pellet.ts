import {
  Data,
  SpendingValidator,
  applyParamsToScript,
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  PelletPelletSpend,
  AsteriaTypesAssetClass
} from "../../onchain/src/plutus.ts";

function buildPelletValidator(admin_token: AsteriaTypesAssetClass): SpendingValidator {
  const validator = new PelletPelletSpend(
    admin_token,
  );

  return validator
}

export { buildPelletValidator };
