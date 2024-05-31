import { STARTING_NAME, TYPE_ARGS } from "@/constants";
import dotenv from "dotenv";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { sha256 } from "js-sha256";
import ADDRESSES from "@/deployed_addresses.json";
import { bcs } from "@mysten/sui/bcs";

const NETWORK = "testnet";
const keccak256 = require("keccak256");

if (!NETWORK) throw new Error("SUI_NETWORK is not set");

const { PACKAGE_ID, ADMIN_CAP, GAME } = ADDRESSES;

const client = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export default async function handler(req: any, res: any) {
  try {
    const txb = new TransactionBlock();
    const usernames = [
      "Vitalikbuterin",
      "saylor",
      "tyler",
      "gavofyork",
      "blknoiz06",
      "cz_binance",
      "AndreCronjeTech",
      "haydenzadams",
      "justinsuntron",
      "IGGYAZALEA",
      "rstormsf",
      "brian_armstrong",
      "IOHK_Charles",
      "ethereumJoseph",
      "ZacPrater",
      "drakefjustin",
    ];
    // Selecet random username
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const response = await fetch("/api/setUsername", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    if (!response.ok) throw new Error("Failed to set username");
    const answer_hash = keccak256(username);
    txb.moveCall({
      target: `${PACKAGE_ID}::round::new`,
      arguments: [
        txb.object(ADMIN_CAP),
        txb.object(GAME),
        txb.pure(bcs.vector(bcs.U8).serialize(answer_hash)),
      ],
      typeArguments: TYPE_ARGS,
    });
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PRIVATE_KEY!));
    const executeResult = await client.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    });

    console.log(executeResult);
    return res.status(200).json({ executeResult });
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ error });
  }
}
