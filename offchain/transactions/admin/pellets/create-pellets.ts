import {
  Assets,
  Constr,
  Data,
  fromText,
  Script,
  toUnit,
  TxHash,
} from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { fetchReferenceScript, lucidBase } from "../../../utils.ts";
import { PelletDatum, PelletDatumT } from "../../../types.ts";
import { PelletPelletSpend, AsteriaTypesAssetClass, AsteriaTypesSpeed } from "../../../../onchain/src/plutus.ts";

async function createPellets(
  prize_tokens: Assets,
  admin_token: AsteriaTypesAssetClass,
  params: { fuel: bigint; pos_x: bigint; pos_y: bigint }[]
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
  const pelletRef = await fetchReferenceScript(lucid, pelletRefTxHash.txHash);
  const pelletValidator = pelletRef.scriptRef as Script;
  const pelletAddressBech32 = lucid.newScript(pelletValidator).toAddress();
  const fuelPolicyId = lucid.newScript(pelletValidator).toHash();

  const spacetimeRefTxHash: { txHash: string } = JSON.parse(
    await Deno.readTextFile("./script-refs/spacetime-ref.json")
  );
  const spacetimeRef = await fetchReferenceScript(
    lucid,
    spacetimeRefTxHash.txHash
  );
  const spacetimeValidator = spacetimeRef.scriptRef as Script;
  const shipyardPolicyId = lucid.newScript(spacetimeValidator).toHash();

  const fuelTokenUnit = toUnit(fuelPolicyId, fromText("FUEL"));
  const adminTokenUnit = toUnit(admin_token.policy, admin_token.name);
  const mintFuelRedeemer = Data.to(new Constr(0, []));
  let tx = await lucid.newTx();

  for (const pellet of params) {
    const pelletInfo = {
      pos_x: pellet.pos_x,
      pos_y: pellet.pos_y,
      shipyard_policy: shipyardPolicyId,
    };
    const pelletDatum = Data.to<PelletDatumT>(
      pelletInfo,
      PelletDatum as unknown as PelletDatumT
    );

    tx = tx
      .readFrom([pelletRef])
      .mint(
        {
          [fuelTokenUnit]: pellet.fuel,
        },
        mintFuelRedeemer
      )
      .payToContract(
        pelletAddressBech32,
        { Inline: pelletDatum },
        {
          [fuelTokenUnit]: pellet.fuel,
          [adminTokenUnit]: BigInt(1),
          ...prize_tokens,
        }
      );
  }
  const completeTx = await tx.commit();
  const signedTx = await completeTx.sign().commit();
  console.log(signedTx.toString());
  return signedTx.submit();
}

export { createPellets };
