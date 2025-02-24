import {
  AsteriaAsteriaSpend,
  DeployDeploySpend,
  PelletPelletSpend,
  SpacetimeSpacetimeSpend,
} from "../../../onchain/src/plutus.ts";
import { lucidBase } from "../src/utils.ts";

import {
  admin_token,
  ship_mint_lovelace_fee,
  max_asteria_mining,
  min_asteria_distance,
  initial_fuel,
  max_speed,
  max_ship_fuel,
  fuel_per_step
} from "./configurations.ts"


//
// VALIDATORS INSTANTIATION
//
const lucid = await lucidBase();

const deployValidator = new DeployDeploySpend(
admin_token,
);
const deployAddress = lucid.newScript(deployValidator).toAddress();

const pelletValidator = new PelletPelletSpend(
admin_token,
);
const pelletHash = lucid.newScript(pelletValidator).toHash();
const pelletAddress = lucid.newScript(pelletValidator).toAddress();

const asteriaValidator = new AsteriaAsteriaSpend(
pelletHash,
admin_token,
ship_mint_lovelace_fee,
max_asteria_mining,
min_asteria_distance,
initial_fuel,
);
const asteriaHash = lucid.newScript(asteriaValidator).toHash();
const asteriaAddress = lucid.newScript(asteriaValidator).toAddress();

const spacetimeValidator = new SpacetimeSpacetimeSpend(
pelletHash,
asteriaHash,
admin_token,
max_speed,
max_ship_fuel,
fuel_per_step,
);
const spacetimeHash = lucid.newScript(spacetimeValidator).toHash();
const spacetimeAddress = lucid.newScript(spacetimeValidator).toAddress();


export {
  deployValidator,
  deployAddress,
  pelletValidator,
  pelletHash,
  pelletAddress,
  asteriaValidator,
  asteriaHash,
  asteriaAddress,
  spacetimeValidator,
  spacetimeHash,
  spacetimeAddress
}