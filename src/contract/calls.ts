import { Transaction } from "@mysten/sui/transactions";
import { STAKE_GUESS, STAKE_ASK, TYPE_ARGS } from "@/constants";
import ADDRESSES from "@/deployed_addresses.json";

const { GAME, PACKAGE_ID } = ADDRESSES;

export async function askQuestion() {
  const txb = new Transaction();
  const [coin] = txb.splitCoins(txb.gas, [STAKE_ASK]);
  txb.moveCall({
    target: `${PACKAGE_ID}::round::ask`,
    arguments: [txb.object(GAME), txb.object(coin)],
    typeArguments: TYPE_ARGS,
  });
  return txb;
}

export async function guessAnswer(guess: string) {
  const txb = new Transaction();
  const [coin] = txb.splitCoins(txb.gas, [STAKE_GUESS]);
  txb.moveCall({
    target: `${PACKAGE_ID}::round::guess`,
    arguments: [txb.object(GAME), txb.object(coin), txb.pure.string(guess)],
    typeArguments: TYPE_ARGS,
  });
  return txb;
}
