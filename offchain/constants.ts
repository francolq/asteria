import { fromText } from "https://deno.land/x/lucid@0.20.5/mod.ts";
import { AsteriaAsteriaSpend, AsteriaTypesAssetClass, AsteriaTypesSpeed } from "../onchain/src/plutus.ts";

const admin_token: AsteriaTypesAssetClass = {
  policy: "0d69753742e6e5fe5f545498708d61f3335adffd90686d41c8529a64",
  name: "0014df105af4eb1811a74ad4e61c45362f84cf69835d2740f9f54019b1e13a07",
};
const ship_mint_lovelace_fee = 3_000_000n;
const max_asteria_mining = 50n;
const max_speed: AsteriaTypesSpeed = {
  distance: 1n,
  time: 30n * 1000n, //milliseconds
};
const max_ship_fuel = 100n;
const fuel_per_step = 1n;
const initial_fuel = 30n;
const min_asteria_distance = 10n;

export {
  admin_token,
  ship_mint_lovelace_fee,
  max_asteria_mining,
  max_speed,
  max_ship_fuel,
  fuel_per_step,
  initial_fuel,
  min_asteria_distance,
};
