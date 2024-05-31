import { Transaction } from "@mysten/sui/transactions";
import { sha256 } from "js-sha256";
import { STAKE, TYPE_ARGS } from "@/constants";
import ADDRESSES from "@/deployed_addresses.json";

const { ADMIN_CAP, GAME, PACKAGE_ID } = ADDRESSES;

export async function newRound(username: string) {
  const txb = new Transaction();
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
  return txb;
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
