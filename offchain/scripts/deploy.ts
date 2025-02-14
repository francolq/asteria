import {
  Data,
  SpendingValidator,
  applyParamsToScript,
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  DeployDeploySpend,
  AsteriaTypesAssetClass
} from "../../onchain/src/plutus.ts";

function buildDeployValidator(admin_token: AsteriaTypesAssetClass): SpendingValidator {
  const validator = new DeployDeploySpend(
    admin_token,
  );

  return validator
}

export { buildDeployValidator };
