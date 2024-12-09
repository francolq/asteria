import { Unwrapped } from "@blaze-cardano/ogmios";
import { Kupmios } from "@blaze-cardano/sdk";
import { mineAsteria } from "../src";
import { GameIdentifier, OutRef } from "../src/types";

async function main() {
    const address =
        "addr_test1qzjpgxkhe06gxzstfhywg02ggy5ltuwne6mfr406dlf0mpwp9a07r34cwsnkpn44tllxuydw4wp0xvstw5jqv5q9lszsk2qynn";

    const provider = new Kupmios(
        process.env.KUPO_URL!,
        await Unwrapped.Ogmios.new(process.env.OGMIOS_URL!)
    );


    const spacetime_script_reference: OutRef = {
        tx_hash:
            "41e5881cd3bdc3f08bcf341796347e9027e3bcd8d58608b4fcfca5c16cbf5921",
        tx_index: 0n,
    };

    const pellet_script_reference: OutRef = {
        tx_hash:
            "ba6fab625d70a81f5d1b699e7efde4b74922d06224bef1f6b84f3adf0a61f3f3",
        tx_index: 0n,
    };

    const asteria_script_reference: OutRef = {
        tx_hash:
            "39871aab15b7c5ab1075ba431d7475f3977fe40fbb8d654b6bdf6f6726659277",
        tx_index: 0n,
    };

    const ship_utxo: OutRef = {
        tx_hash:
            "594fb0c4baff88873d15d5973103efc667052deec3315ba4bc89aeaaf53dd407",
        tx_index: 0n,
    };


    const gameIdentifier: GameIdentifier = {
        ship_utxo,
        spacetime_script_reference,
        pellet_script_reference,
        asteria_script_reference,
    };

    const tx = await mineAsteria(
        provider,
        address,
        gameIdentifier,
    );

    return tx;
}

main().then((tx) => {
    console.log(tx.toCbor());
});