import React, { useEffect, useState, useRef } from "react";
import {
	getTokenPrice,
	increaseTokenAllowance,
	increaseWethAllowance,
	swapTokensToWeth,
	swapWethToTokens,
	swapWethToTokensBatch,
	tokenAllowance,
	unwrapEth,
	wethAllowance,
	wrapEth,
} from "../utils/queries";
import {
	CONNECT_WALLET,
	ENTER_AMOUNT,
	SELECT_PAIR,
	SWAP,
	SWITCH_NETWORK,
	getSwapBtnClassName,
	notifyError,
	notifySuccess,
} from "../utils/swap-utils";
import { CogIcon } from "@heroicons/react/outline";
import { CgArrowsExchangeV } from "react-icons/cg";

import SwapField from "./SwapField";
import TransactionStatus from "./TransactionStatus";

import { DEFAULT_VALUE, WETH, getCoinAddress } from "../utils/SupportedCoins";

import NavItems from "./NavItems";
import SwapOptions from "./swapOptions";
import useSwaps from "../hooks/useSwaps";
import { pairIsWhitelisted } from "../utils/pools-utils";

import { optimismSepolia, optimism } from "thirdweb/chains";
import useWeb3Store from "../zustand/store";
import { useActiveAccount, useSendBatchTransaction } from "thirdweb/react";
import { getContract } from "thirdweb";
import { deposit, withdraw, approve } from "thirdweb/extensions/erc20";
import { thirdwebWethContract } from "../config/thirdwebClient";
const Swap = () => {
	const smartAccount = useActiveAccount();
	//const isHuman = useWeb3Store((state) => state.isHuman);
	const {
		mutate: sendBatch,
		data: transactionResult,
		isPending,
	} = useSendBatchTransaction();

	const {
		srcToken,
		setSrcToken,
		destToken,
		setDestToken,
		inputValue,
		setInputValue,
		outputValue,
		setOutputValue,
		swapOptionsOpen,
		setSwapOptionsOpen,
		slippage,
		setSlippage,
		swapBtnText,
		setSwapBtnText,
		txPending,
		setTxPending,
		isReversed,
		srcTokenObj,
		destTokenObj,
		price,
		setPrice,
		loading,
		address,
	} = useSwaps();

	const setTransactionMessage = useWeb3Store(
		(state) => state.setTransactionMessage
	);
	const transactionMessage = useWeb3Store((state) => state.transactionMessage);
	const initializeValues = () => {
		setInputValue("");
		setOutputValue("");
	};
	useEffect(() => {
		const isWhiteListed = pairIsWhitelisted(
			getCoinAddress(srcToken),
			getCoinAddress(destToken)
		);

		if (!address) setSwapBtnText(CONNECT_WALLET);
		else if (
			srcToken === DEFAULT_VALUE ||
			destToken === DEFAULT_VALUE ||
			!isWhiteListed
		)
			setSwapBtnText(SELECT_PAIR);
		else if (
			address &&
			srcToken !== DEFAULT_VALUE &&
			destToken !== DEFAULT_VALUE &&
			!inputValue &&
			!outputValue
		)
			setSwapBtnText(ENTER_AMOUNT);
		else setSwapBtnText(SWAP);
		console.log(srcToken, destToken);
	}, [inputValue, outputValue, address, srcToken, destToken, isReversed]);

	useEffect(() => {
		setInputValue("");
		setOutputValue("");
	}, []);

	const performSwap = async () => {
		setTxPending(true);
		try {
			let receipt;
			console.log(srcToken, destToken);

			if (srcToken === WETH && destToken !== WETH) {
				receipt = await swapWethToTokens(
					outputValue,
					getCoinAddress(destToken)
				);

				if (!receipt) {
					throw new Error("Transaction failed");
				}
				notifySuccess("Swap completed succesfully!");
				return;
			} else if (srcToken !== WETH && destToken === WETH) {
				receipt = await swapTokensToWeth(inputValue, getCoinAddress(srcToken));
				if (!receipt) {
					throw new Error("Transaction failed");
				}
				console.log("swap succesful", receipt);

				setInputValue("");
				setOutputValue("");
			}

			if (receipt && !receipt.hasOwnProperty("transactionHash")) {
				notifyError(receipt);
			} else {
				notifySuccess();
			}
		} catch (error) {
			console.log(error);
			// notifyError("Transaction failed");
		}
	};

	const handleSwap = async () => {
		try {
			await performSwap();
		} catch (error) {
			notifyError("Transaction failed");
			console.log(error);
		}
		setTxPending(false);
	};

	function handleReverseExchange(e) {
		isReversed.current = true;

		setInputValue(outputValue);
		setOutputValue(inputValue);

		setSrcToken(destToken);
		setDestToken(srcToken);
		initializeValues();
	}

	return (
		<div className="p-4 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900  text-white">
			<div className="flex md:px-4">
				<NavItems />
			</div>

			<div className="flex items-center justify-between px-1 my-4">
				<p>Swap</p>

				{swapOptionsOpen ? (
					<SwapOptions
						setSlippage={setSlippage}
						setSwapOptionsOpen={setSwapOptionsOpen}
					/>
				) : (
					<CogIcon
						className="h-6 cursor-pointer"
						onClick={() => setSwapOptionsOpen(true)}
					/>
				)}
			</div>
			<div className="flex bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600">
				<SwapField
					loading={loading}
					fieldProps={{
						...srcTokenObj,
						setCounterPart: setOutputValue,
						price,
						srcToken,
						destToken,
						address,
					}}
				/>

				<CgArrowsExchangeV
					className="fixed left-1/2 -translate-x-1/2 -translate-y-[-120%] text-[4rem] justify-center  h-10 p-1 bg-[#212429] border-4 border-zinc-900 text-zinc-300 rounded-xl cursor-pointer hover:scale-110"
					onClick={handleReverseExchange}
				/>
			</div>

			<div className="bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600">
				<SwapField
					loading={loading}
					fieldProps={{
						...destTokenObj,
						setCounterPart: setInputValue,
						price,
						srcToken,
						destToken,
						address,
					}}
				/>
			</div>

			<button
				className={getSwapBtnClassName(swapBtnText)}
				onClick={() => {
					if (swapBtnText === SWAP) {
						//isHuman &&
						handleSwap();
						//!isHuman && notifyError("No human detected");
					} else if (swapBtnText === CONNECT_WALLET) openConnectModal();
				}}
			>
				{swapBtnText}
			</button>

			{txPending && (
				<TransactionStatus transactionMessage={transactionMessage} />
			)}
		</div>
	);
};

export default Swap;
