import { fromText } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { spendRefUTxOs } from "../../transactions/deploy/spend-refs.ts";
import { AssetClassT } from "../../types.ts";

const admin_token: AssetClassT = {
  policy: "0298aa99f95e2fe0a0132a6bb794261fb7e7b0d988215da2f2de2005",
  name: fromText("tokenA"),
};

const txHash = await spendRefUTxOs(admin_token);
console.log(txHash);