import {
  Data,
  Script,
  toUnit,
  TxHash,
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { fetchReferenceScript, lucidBase } from "../../../utils.ts";
import {
  AsteriaAsteriaSpend,
  AsteriaTypesAssetClass,
  AsteriaTypesSpeed
} from "../../../../onchain/src/plutus.ts";

async function createAsteria(admin_token: AsteriaTypesAssetClass): Promise<TxHash> {
  const lucid = await lucidBase();
  const seed = Deno.env.get("SEED");
  if (!seed) {
    throw Error("Unable to read wallet's seed from env");
  }
  lucid.selectWalletFromSeed(seed);

  const asteriaRefTxHash: { txHash: string } = JSON.parse(
    await Deno.readTextFile("./script-refs/asteria-ref.json")
  );
  const asteriaRef = await fetchReferenceScript(lucid, asteriaRefTxHash.txHash);
  const asteriaValidator = asteriaRef.scriptRef as Script;
  const asteriaAddressBech32 = lucid.newScript(asteriaValidator).toAddress();

  const spacetimeRefTxHash: { txHash: string } = JSON.parse(
    await Deno.readTextFile("./script-refs/spacetime-ref.json")
  );
  const spacetimeRef = await lucid.utxosByOutRef([
    {
      txHash: spacetimeRefTxHash.txHash,
      outputIndex: 0,
    },
  ]);
  const spacetimeValidator = spacetimeRef[0].scriptRef;
  if (!spacetimeValidator) {
    throw Error("Could not read pellet validator from ref UTxO");
  }
  const shipyardPolicyId = lucid.newScript(spacetimeValidator).toHash();

  const asteriaInfo = {
    shipCounter: 0n,
    shipyardPolicy: shipyardPolicyId,
  };

  const adminTokenUnit = toUnit(admin_token.policy, admin_token.name);
  const tx = await lucid
    .newTx()
    .payToContract(
      asteriaAddressBech32,
      { Inline: Data.to(asteriaInfo, AsteriaAsteriaSpend.datum) },
      {
        [adminTokenUnit]: 1n,
      }
    )
    .commit();

  const signedTx = await tx.sign().commit();
  console.log(signedTx.toString());
  return signedTx.submit();
}

export { createAsteria };
