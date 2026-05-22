import { DEFAULT_VALUE, WETH } from "./SupportedCoins";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers";
export const INCREASE_ALLOWANCE = "Increase allowance";
export const ENTER_AMOUNT = "Enter an amount";
export const INVALID_AMOUNT = "Invalid amount";
export const PAIR_NOT_AVAILABLE = "Pair not available";
export const SELECT_PAIR = "Select a valid pair";
export const ADD_OR_REMOVE_LIQUIDITY = "Add or remove liquidity";
export const CONFIRM = "Confirm";
export const CONNECT_WALLET = "Connect wallet";
export const SWITCH_NETWORK = "Switch to OP sepolia network";
export const SWAP = "Swap";
export const defaultSlippage = 20;

export const notifyError = (msg) => toast.error(msg, { duration: 6000 });
export const notifySuccess = () => toast.success("Transaction completed.");
export const getSwapBtnClassName = (swapBtnText) => {
	const base = "p-4 w-full my-4 rounded-xl font-semibold text-base transition-all duration-200 text-white";

	switch (swapBtnText) {
		case CONNECT_WALLET:
			return `${base} bg-[#840c4a] hover:bg-[#9e1058] cursor-pointer shadow-lg shadow-[#840c4a]/30`;
		case SWAP:
			return `${base} bg-[#840c4a] hover:bg-[#9e1058] cursor-pointer shadow-lg shadow-[#840c4a]/30`;
		case ADD_OR_REMOVE_LIQUIDITY:
			return `${base} bg-[#840c4a] hover:bg-[#9e1058] cursor-pointer shadow-lg shadow-[#840c4a]/30`;
		case ENTER_AMOUNT:
			return `${base} bg-zinc-700 opacity-60 pointer-events-none`;
		case SELECT_PAIR:
			return `${base} bg-zinc-700 opacity-60 pointer-events-none`;
		default:
			return `${base} bg-zinc-700 opacity-60 pointer-events-none`;
	}
};
const ALLOWED_SLIPPAGE = ethers.BigNumber.from(200);
export function calculateSlippageBounds(value) {
	const offset = value.mul(ALLOWED_SLIPPAGE).div(ethers.BigNumber.from(10000));
	const minimum = value.sub(offset);
	const maximum = value.add(offset);
	return {
		minimum: minimum.lt(ethers.constants.Zero)
			? ethers.constants.Zero
			: minimum,
		maximum: maximum.gt(ethers.constants.MaxUint256)
			? ethers.constants.MaxUint256
			: maximum,
	};
}

//
