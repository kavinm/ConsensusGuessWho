import { Transaction } from "@mysten/sui/transactions";
import { sha256 } from "js-sha256";
import { STAKE, TYPE_ARGS } from "@/constants";
import ADDRESSES from "@/deployed_addresses.json";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { getSuiClient } from "@/contract/indexer";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const { ADMIN_CAP, GAME, PACKAGE_ID } = ADDRESSES;

export async function newRound(username: string) {
  const client = await getSuiClient();
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

export async function askQuestion() {
  const txb = new Transaction();
  const [coin] = txb.splitCoins(txb.gas, [STAKE]);
  txb.moveCall({
    target: `${PACKAGE_ID}::round::ask`,
    arguments: [txb.object(GAME), txb.object(coin)],
    typeArguments: TYPE_ARGS,
  });
  return txb;
}

export async function guessAnswer(guess: string) {
  const txb = new Transaction();
  const [coin] = txb.splitCoins(txb.gas, [STAKE]);
  txb.moveCall({
    target: `${PACKAGE_ID}::round::guess`,
    arguments: [txb.object(GAME), txb.object(coin), txb.pure.string(guess)],
    typeArguments: TYPE_ARGS,
  });
  return txb;
}
