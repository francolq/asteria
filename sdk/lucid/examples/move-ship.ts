import { fromText, Data } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  SpacetimeSpacetimeSpend,
  PelletPelletMint,
  AsteriaTypesShipDatum
} from "../../../onchain/src/plutus.ts";
import { lucidBase, distance, required_fuel } from "../src/utils.ts";
import {
  asteriaAddress,
  asteriaHash,
  spacetimeAddress,
  spacetimeHash,
  pelletAddress,
  pelletHash
} from "../src/validators.ts";
import {
  deployTxHash,
  fuel_per_step
} from "../src/configurations.ts"

console.log("MOVING SHIP");

const lucid = await lucidBase();

console.log("ASTERIA SCRIPT ADDRESS:", { asteriaAddress, asteriaHash });
console.log("SPACETIME SCRIPT ADDRESS:", { spacetimeAddress, spacetimeHash });
console.log("PELLET SCRIPT ADDRESS:", { pelletAddress, pelletHash });

// OR ship token
const shipNumber = 0n
const deltaX = 1n
const deltaY = 0n

//
// UTXO QUERIES
//
// TODO: can we do this shorter?
const [spacetimeRef] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 1,
}]);
const [pelletRef] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 2,
}]);
//
// SHIP MOVING TX
//
const fuelToken = pelletHash + fromText("FUEL");
const shipToken = spacetimeHash + fromText("SHIP" + shipNumber);
const pilotToken = spacetimeHash + fromText("PILOT" + shipNumber);

const ttl = Date.now() + 10 * 60 * 1000; // now + 10 minutes (in miliseconds)
// console.log("NOW:", ttl);

const [shipUTxO] = await lucid.utxosAtWithUnit(spacetimeAddress, shipToken)

if (!shipUTxO) {
  console.log("NO SHIP UTXO FOUND FOR SHIP NUMBER:", {shipNumber})
}

const shipDatum = Data.from(shipUTxO.datum!, SpacetimeSpacetimeSpend.datum)
const shipFuel = shipUTxO.assets[fuelToken]

const shipDatum2: AsteriaTypesShipDatum = {
  posX: shipDatum.posX + deltaX,
  posY: shipDatum.posY + deltaY,
  shipTokenName: shipDatum.shipTokenName,
  pilotTokenName: shipDatum.pilotTokenName,
  lastMoveLatestTime: BigInt(ttl)
}

const movedDistance = distance(deltaX, deltaY);
const spentFuel = required_fuel(movedDistance, fuel_per_step);

const tx = await lucid
  .newTx()
  .validFrom(Number(shipDatum.lastMoveLatestTime) + 1000)
  .validTo(ttl)  // beware: this number gets rounded down
  .readFrom([spacetimeRef, pelletRef])
  .collectFrom(
    [shipUTxO],
    Data.to({"MoveShip": {
      deltaX: deltaX,
      deltaY: deltaY
    }
    }, SpacetimeSpacetimeSpend.redeemer)
  )
  .mint(
    {
      [fuelToken]: -spentFuel
    },
    Data.to("BurnFuel",PelletPelletMint.redeemer)
  )
  .payToContract(
    spacetimeAddress,
    { Inline: Data.to(shipDatum2, SpacetimeSpacetimeSpend.datum)},
    {
      [shipToken]: 1n,
      [fuelToken]: shipFuel - spentFuel
    }
  )
  .payTo(await lucid.wallet.address(), {
    [pilotToken]: 1n,
  })
  .commit();

const signedTx = await tx.sign().commit();
// console.log(signedTx.toString());
const txHash = await signedTx.submit();
console.log("CREATE SHIP TXHASH:", txHash);
