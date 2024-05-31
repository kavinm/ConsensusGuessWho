import { STARTING_NAME, TYPE_ARGS } from "@/constants";
import dotenv from "dotenv";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { sha256 } from "js-sha256";
import ADDRESSES from "@/deployed_addresses.json";

dotenv.config({ path: ".env" });
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY is not set");
const NETWORK = "testnet";

if (!NETWORK) throw new Error("NEXT_PUBLIC_SUI_NETWORK is not set");

const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PRIVATE_KEY));
const { PACKAGE_ID, ADMIN_CAP, GAME } = ADDRESSES;

const client = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

async function main(username: string) {
  const txb = new TransactionBlock();
  const influencer = sha256(username);
  txb.moveCall({
    target: `${PACKAGE_ID}::round::new`,
    arguments: [
      txb.object(ADMIN_CAP),
      txb.object(GAME),
      txb.pure.string(influencer),
    ],
    typeArguments: TYPE_ARGS,
  });
  const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PRIVATE_KEY!));
  const executeResult = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair,
  });

  console.log(executeResult);
}

main(STARTING_NAME);
