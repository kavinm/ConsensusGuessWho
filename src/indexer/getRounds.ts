import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import ADDRESSES from "../deployed_addresses.json";

export async function getRounds() {
  await getRoundObject();
}

async function getRoundObject() {
  const { GAME } = ADDRESSES;
  const client = await getSuiClient();
  const game = await client.getDynamicFields({
    parentId: GAME,
  });
  console.log(game.data);
  return game.data;
}

async function getSuiClient() {
  return new SuiClient({ url: getFullnodeUrl("testnet") });
}
