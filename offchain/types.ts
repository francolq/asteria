import { Data } from "https://deno.land/x/lucid@0.20.5/mod.ts";

const AsteriaDatum = Data.Object({
  ship_counter: Data.Integer(),
  shipyard_policy: Data.Bytes({ maxLength: 28 }),
});
type AsteriaDatumT = Data.Static<typeof AsteriaDatum>;

const PelletDatum = Data.Object({
  pos_x: Data.Integer(),
  pos_y: Data.Integer(),
  shipyard_policy: Data.Bytes({ maxLength: 28 }),
});
type PelletDatumT = Data.Static<typeof PelletDatum>;

const ShipDatum = Data.Object({
  pos_x: Data.Integer(),
  pos_y: Data.Integer(),
  ship_token_name: Data.Bytes(),
  pilot_token_name: Data.Bytes(),
  last_move_latest_time: Data.Integer(),
});
type ShipDatumT = Data.Static<typeof ShipDatum>;

export { AsteriaDatum, PelletDatum, ShipDatum };
export type { AsteriaDatumT, PelletDatumT, ShipDatumT };
