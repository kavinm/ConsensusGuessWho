import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import ADDRESSES from "../deployed_addresses.json";

export async function getStakeBalance() {
  const { GAME } = ADDRESSES;
  const object = await getRoundObject();
  const client = await getSuiClient();
  const data = await client.getDynamicFieldObject({
    name: object.name,
    parentId: GAME,
  });
  return (data.data?.content as any).fields.value.fields.stake;
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

async function getSuiClient() {
  return new SuiClient({ url: getFullnodeUrl("testnet") });
}
