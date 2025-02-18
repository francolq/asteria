import { Data } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { lucidBase, writeJson } from "../../../utils.ts";
import { buildSpacetimeValidator } from "../../../scripts/spacetime.ts";
import { buildDeployValidator } from "../../../scripts/deploy.ts";
import { AsteriaTypesAssetClass, AsteriaTypesSpeed } from "../../../../onchain/src/plutus.ts";

async function deploySpacetime(
  admin_token: AsteriaTypesAssetClass,
  max_speed: AsteriaTypesSpeed,
  max_ship_fuel: bigint,
  fuel_per_step: bigint,
): Promise<any> {
  const lucid = await lucidBase();
  const seed = Deno.env.get("SEED");
  if (!seed) {
    throw Error("Unable to read wallet's seed from env");
  }
  lucid.selectWalletFromSeed(seed);

  const asteriaRefTxHash: { txHash: string } = JSON.parse(
    await Deno.readTextFile("./script-refs/asteria-ref.json")
  );
  const asteriaRef = await lucid.utxosByOutRef([
    {
      txHash: asteriaRefTxHash.txHash,
      outputIndex: 0,
    },
  ]);
  const asteriaValidator = asteriaRef[0].scriptRef;
  if (!asteriaValidator) {
    throw Error("Could not read Asteria validator from ref UTxO");
  }
  const asteriaAddressBech32 = lucid.newScript(asteriaValidator).toAddress();
  const asteriaScriptAddress = lucid.newScript(asteriaValidator).toHash();

  const pelletRefTxHash: { txHash: string } = JSON.parse(
    await Deno.readTextFile("./script-refs/pellet-ref.json")
  );
  const pelletRef = await lucid.utxosByOutRef([
    {
      txHash: pelletRefTxHash.txHash,
      outputIndex: 0,
    },
  ]);
  const pelletValidator = pelletRef[0].scriptRef;
  if (!pelletValidator) {
    throw Error("Could not read pellet validator from ref UTxO");
  }
  const pelletScriptAddress = lucid.newScript(pelletValidator).toHash();

  console.log("PELLET SCRIPT ADDRESS:", pelletScriptAddress);
  console.log("ASTERIA SCRIPT ADDRESS:", asteriaScriptAddress);

  const spacetimeValidator = buildSpacetimeValidator(
    pelletScriptAddress,
    asteriaScriptAddress,
    admin_token,
    max_speed,
    max_ship_fuel,
    fuel_per_step,
  );

  // ONLY FOR LOGGING PURPOSES:
  const spacetimeScriptAddress = lucid.newScript(spacetimeValidator).toHash();
  console.log("SPACETIME SCRIPT ADDRESS:", spacetimeScriptAddress);

  const deployValidator = buildDeployValidator(admin_token);
  const deployAddressBech32 = lucid.newScript(deployValidator).toAddress();

  const tx = await lucid
    .newTx()
    .payToContract(
      deployAddressBech32,
      {
        Inline: Data.void(),
        scriptRef: spacetimeValidator,
      },
      {}
    )
    .commit();

  const signedTx = await tx.sign().commit();
  console.log(signedTx.toString());
  const txHash = await signedTx.submit();

  console.log(
    writeJson("./script-refs/spacetime-ref.json", { txHash: txHash })
  );

  return txHash;
}

export { deploySpacetime };
