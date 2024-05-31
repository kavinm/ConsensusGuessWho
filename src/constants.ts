import { SUI_DECIMALS } from "@mysten/sui/utils";

const SUI_MULTIPLIER = Math.pow(10, SUI_DECIMALS);

export const STAKE_ASK = 0.01 * SUI_MULTIPLIER;
export const STAKE_GUESS = 0.1 * SUI_MULTIPLIER;
export const TYPE_ARGS = ["0x2::sui::SUI"];
export const STARTING_NAME = "VitalikButerin";
