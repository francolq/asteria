import { Address, Data, TxHash } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { buildAsteriaValidator } from "../../../scripts/asteria.ts";
import { lucidBase, writeJson } from "../../../utils.ts";
import { buildDeployValidator } from "../../../scripts/deploy.ts";
import { AsteriaTypesAssetClass } from "../../../../onchain/src/plutus.ts";

async function deployAsteria(
  admin_token: AsteriaTypesAssetClass,
  ship_mint_lovelace_fee: bigint,
  max_asteria_mining: bigint,
  initial_fuel: bigint,
  min_asteria_distance: bigint,
): Promise<TxHash> {
  const lucid = await lucidBase();
  const seed = Deno.env.get("SEED");
  if (!seed) {
    throw Error("Unable to read wallet's seed from env");
  }
  lucid.selectWalletFromSeed(seed);

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

  const asteriaValidator = buildAsteriaValidator(
    pelletScriptAddress,
    admin_token,
    ship_mint_lovelace_fee,
    max_asteria_mining,
    min_asteria_distance,
    initial_fuel,
  );

  // ONLY FOR LOGGING PURPOSES:
  const asteriaScriptAddress = lucid.newScript(asteriaValidator).toHash();
  console.log("ASTERIA SCRIPT ADDRESS:", asteriaScriptAddress);

  const deployValidator = buildDeployValidator(admin_token);
  const deployAddressBech32 = lucid.newScript(deployValidator).toAddress();

  const tx = await lucid
    .newTx()
    .payToContract(
      deployAddressBech32,
      {
        Inline: Data.void(),
        scriptRef: asteriaValidator,
      },
      {}
    )
    .commit();

  const signedTx = await tx.sign().commit();
  console.log(signedTx.toString());

  const txHash = await signedTx.submit();
  console.log(writeJson("./script-refs/asteria-ref.json", { txHash: txHash }));
  return txHash;
}

export { deployAsteria };
