import { deploySpacetime } from "../../../transactions/admin/deploy/deploy-spacetime.ts";
import {
  admin_token,
  max_speed,
  max_ship_fuel,
  fuel_per_step,
} from "../../../constants.ts";
import { printTxURL } from "../../../utils.ts";

const txHash = await deploySpacetime(
  admin_token,
  max_speed,
  max_ship_fuel,
  fuel_per_step,
);

printTxURL(txHash);
