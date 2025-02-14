import { Data, TxHash } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { lucidBase, writeJson } from "../../../utils.ts";
import { buildPelletValidator } from "../../../scripts/pellet.ts";
import { buildDeployValidator } from "../../../scripts/deploy.ts";
import { AsteriaTypesAssetClass } from "../../../../onchain/src/plutus.ts";

async function deployPellet(admin_token: AsteriaTypesAssetClass): Promise<TxHash> {
  const lucid = await lucidBase();
  const seed = Deno.env.get("SEED");
  if (!seed) {
    throw Error("Unable to read wallet's seed from env");
  }
  lucid.selectWalletFromSeed(seed);

  const pelletValidator = buildPelletValidator(admin_token);
  const deployValidator = buildDeployValidator(admin_token);
  const deployAddressBech32 = lucid.newScript(deployValidator).toAddress();

  const tx = await lucid
    .newTx()
    .payToContract(
      deployAddressBech32,
      {
        Inline: Data.void(),
        scriptRef: pelletValidator,
      },
      {}
    )
    .commit();

  const signedTx = await tx.sign().commit();
  console.log(signedTx.toString());
  const txHash = await signedTx.submit();

  console.log(writeJson("./script-refs/pellet-ref.json", { txHash: txHash }));
  return txHash;
}

export { deployPellet };
