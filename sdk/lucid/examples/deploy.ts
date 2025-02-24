import { Data } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import {
  AsteriaAsteriaSpend,
} from "../../../onchain/src/plutus.ts";
import { lucidBase } from "../src/utils.ts";
import {
  deployAddress,
  asteriaValidator,
  asteriaAddress,
  asteriaHash,
  spacetimeValidator,
  spacetimeAddress,
  spacetimeHash,
  pelletValidator,
  pelletAddress,
  pelletHash
} from "../src/validators.ts";
import { admin_token,  } from "../src/configurations.ts";
console.log("DEPLOYING ASTERIA");

//
// CONFIGURATION
//

const lucid = await lucidBase();

console.log("ASTERIA SCRIPT ADDRESS:", { asteriaAddress, asteriaHash });
console.log("SPACETIME SCRIPT ADDRESS:", { spacetimeAddress, spacetimeHash });
console.log("PELLET SCRIPT ADDRESS:", { pelletAddress, pelletHash });

//
// ASTERIA
//
const adminToken = admin_token.policy + admin_token.name;
const asteriaDatum = {
  shipCounter: 0n,
  shipyardPolicy: spacetimeHash,
};

//
// DEPLOYMENT TX (REFERENCE SCRIPTS AND ASTERIA)
//
const tx = await lucid
  .newTx()
  .payToContract(
    deployAddress,
    {
      Inline: Data.void(),
      scriptRef: asteriaValidator,
    },
    {}
  )
  .payToContract(
    deployAddress,
    {
      Inline: Data.void(),
      scriptRef: spacetimeValidator,
    },
    {}
  )
  .payToContract(
    deployAddress,
    {
      Inline: Data.void(),
      scriptRef: pelletValidator,
    },
    {}
  )
  .payToContract(
    asteriaAddress,
    { Inline: Data.to(asteriaDatum, AsteriaAsteriaSpend.datum) },
    {
      [adminToken]: 1n,
    }
  )
  .commit();

const signedTx = await tx.sign().commit();
// console.log(signedTx.toString());
const txHash = await signedTx.submit();
console.log("DEPLOYMENT TXHASH:", txHash);
