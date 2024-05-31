import dotenv from "dotenv";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX, SUI_DECIMALS } from "@mysten/sui.js/utils";
import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectChange,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import ADDRESSES from "../deployed_addresses.json";
import { sha256 } from "js-sha256";
import { bcs } from "@mysten/sui/bcs";
const keccak256 = require("keccak256");

dotenv.config({ path: ".env" });
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY is not set");

const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PRIVATE_KEY));
const client = new SuiClient({ url: getFullnodeUrl("testnet") });

console.log("Running script...");

const { PACKAGE_ID, GAME } = ADDRESSES;

main();

async function main() {
  // create companies
  const txb = new TransactionBlock();
  const hash = keccak256("VitalikButerin");
  txb.moveCall({
    target: `${PACKAGE_ID}::round::check_hashes_equal`,
    arguments: [
      txb.pure.string("VitalikButerin1"),
      txb.pure(bcs.vector(bcs.U8).serialize(hash)),
    ],
  });
  // txb.moveCall({
  //   target: `${PACKAGE_ID}::round::hash_guess`,
  //   arguments: [txb.pure.string("VitalikButerin")],
  // });
  const res = await client.devInspectTransactionBlock({
    sender: keypair.getPublicKey().toSuiAddress(),
    transactionBlock: txb,
  });
  console.dir(res, { depth: null });
  // let byteArray = new Uint8Array((res.results as any)[0]?.returnValues[0][0]);
  // // Creating textDecoder instance
  // let decoder = new TextDecoder("utf-8");

  // // Using decode method to get string output
  // let str = decoder.decode(byteArray);

  // // Display the output
  // console.log("HashChain: ", str);
  // console.log("JSHash: ", hash);
  // const tx = await client.signAndExecuteTransactionBlock({
  //   signer: keypair,
  //   transactionBlock: txb,
  //   options: {
  //     showEvents: true,
  //   },
  // });

  console.log(
    "----------------------------------------------------------------------------------------------------"
  );

  const sui =
    parseFloat(
      (await client.getCoins({ owner: keypair.getPublicKey().toSuiAddress() }))
        .data[0].balance
    ) / Math.pow(10, SUI_DECIMALS);
  console.log("Remaining Balance: ", sui + " SUI");
}
