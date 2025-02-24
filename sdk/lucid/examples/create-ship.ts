import { fromText, Data } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  AsteriaAsteriaSpend,
  SpacetimeSpacetimeSpend,
  SpacetimeSpacetimeMint,
  PelletPelletMint
} from "../../../onchain/src/plutus.ts";
import { lucidBase } from "../src/utils.ts";
import {
  asteriaAddress,
  asteriaHash,
  spacetimeAddress,
  spacetimeHash,
  pelletAddress,
  pelletHash
} from "../src/validators.ts";
import {
  ship_mint_lovelace_fee,
  initial_fuel,
  deployTxHash,
  adminToken
} from "../src/configurations.ts"

console.log("CREATING SHIP");

const lucid = await lucidBase();

console.log("ASTERIA SCRIPT ADDRESS:", { asteriaAddress, asteriaHash });
console.log("SPACETIME SCRIPT ADDRESS:", { spacetimeAddress, spacetimeHash });
console.log("PELLET SCRIPT ADDRESS:", { pelletAddress, pelletHash });

//
// UTXO QUERIES
//
// TODO: can we do this shorter?
const [asteriaRef] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 0,
}]);
const [spacetimeRef] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 1,
}]);
const [pelletRef] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 2,
}]);
const [asteria] = await lucid.utxosByOutRef([{
  txHash: deployTxHash,
  outputIndex: 3,
}]);

// const [asteria] = await lucid.utxosAt(asteriaAddress);
// TODO: check admin token
const asteriaDatum = Data.from(asteria.datum!, AsteriaAsteriaSpend.datum);

console.log(asteriaDatum);

//
// SHIP CREATION TX
//
const fuelToken = pelletHash + fromText("FUEL");
const shipToken = spacetimeHash + fromText("SHIP" + asteriaDatum.shipCounter);
const pilotToken = spacetimeHash + fromText("PILOT" + asteriaDatum.shipCounter);

const ttl = Date.now() + 10 * 60 * 1000; // now + 10 minutes (in miliseconds)
// console.log("NOW:", ttl);

const shipDatum = {
  posX: 20n,
  posY: 20n,
  shipTokenName: fromText("SHIP" + asteriaDatum.shipCounter),
  pilotTokenName: fromText("PILOT" + asteriaDatum.shipCounter),
  lastMoveLatestTime: BigInt(ttl),
};
const asteriaDatum2 = {
  shipCounter: asteriaDatum.shipCounter + 1n,
  shipyardPolicy: asteriaDatum.shipyardPolicy,
};

const tx = await lucid
  .newTx()
  .validTo(ttl)  // beware: this number gets rounded down
  .readFrom([asteriaRef, spacetimeRef, pelletRef])
  .collectFrom(
    [asteria],
    Data.to("AddNewShip", AsteriaAsteriaSpend.redeemer)
  )
  .mint(
    {
      [shipToken]: 1n,
      [pilotToken]: 1n,
    },
    Data.to("MintShip", SpacetimeSpacetimeMint.redeemer)
  )
  .mint(
    {
      [fuelToken]: initial_fuel,
    },
    Data.to("MintFuel", PelletPelletMint.redeemer)
  )
  .payToContract(
    spacetimeAddress,
    { Inline: Data.to(shipDatum, SpacetimeSpacetimeSpend.datum) },
    {
      [shipToken]: 1n,
      [fuelToken]: initial_fuel,
    }
  )
  .payToContract(
    asteriaAddress,
    { Inline: Data.to(asteriaDatum2, AsteriaAsteriaSpend.datum) },
    {
      [adminToken]: 1n,
      lovelace: asteria.assets.lovelace + ship_mint_lovelace_fee,
    }
  )
  // .toInstructions();
  .commit();

const signedTx = await tx.sign().commit();
// console.log(signedTx.toString());
const txHash = await signedTx.submit();
console.log("CREATE SHIP TXHASH:", txHash);
