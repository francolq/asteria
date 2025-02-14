import { deployAsteria } from "../../../transactions/admin/deploy/deploy-asteria.ts";
import {
  admin_token,
  ship_mint_lovelace_fee,
  max_asteria_mining,
  initial_fuel,
  min_asteria_distance,
} from "../../../constants.ts";
import { printTxURL } from "../../../utils.ts";

const txHash = await deployAsteria(
  admin_token,
  ship_mint_lovelace_fee,
  max_asteria_mining,
  initial_fuel,
  min_asteria_distance,
);

printTxURL(txHash);
