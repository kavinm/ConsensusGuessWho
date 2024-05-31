import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import ADDRESSES from "../deployed_addresses.json";
import { SUI_DECIMALS } from "@mysten/sui.js/utils";

export async function getStakeBalance() {
  const { GAME } = ADDRESSES;
  const object = await getRoundObject();
  const client = await getSuiClient();
  const data = await client.getDynamicFieldObject({
    name: object.name,
    parentId: GAME,
  });
  // Balance in MIST
  const balance = (data.data?.content as any).fields.value.fields.stake;
  // Balance in SUI
  return balance / Math.pow(10, SUI_DECIMALS);
}

async function getRoundObject() {
  const { GAME } = ADDRESSES;
  const client = await getSuiClient();
  const game = await client.getDynamicFields({
    parentId: GAME,
  });
  console.log(game.data);
  return game.data[0];
}

export async function getSuiClient() {
  return new SuiClient({ url: getFullnodeUrl("testnet") });
}
