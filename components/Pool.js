"use client";
import React, { useEffect, useState } from "react";

import {
	addLiquidity,
	increaseAllowance,
	lpTokenAllowance,
	removeLiquidity,
	unwrapEth,
	wethBalance,
	wrapEth,
} from "../utils/queries";
import {
	ADD_OR_REMOVE_LIQUIDITY,
	CONNECT_WALLET,
	ENTER_AMOUNT,
	SELECT_PAIR,
	getSwapBtnClassName,
	notifyError,
	notifySuccess,
} from "../utils/swap-utils";
import { CogIcon } from "@heroicons/react/outline";

import { Toaster } from "react-hot-toast";

import { usePools } from "../hooks/usePools";
import { whitelistedPools } from "../utils/whitelistedPools";
import {
	DEFAULT_VALUE,
	WETH,
	MTB24,
	getCoinAddress,
	coinAddresses,
} from "../utils/SupportedCoins";

import LiquidityModal from "./LiquidityModal";
import { toWei } from "../utils/ether-utils";
import { RiRefreshLine } from "react-icons/ri";
import { FiRefreshCcw } from "react-icons/fi";
import NavItems from "./NavItems";
import { getBalances, pairIsWhitelisted } from "../utils/pools-utils";
import PoolField from "./PoolField";
import TransactionStatus from "./TransactionStatus";
const Pool = () => {
	const whitelisted = whitelistedPools;

	const {
		pools,
		setRefresh,
		refresh,
		refreshAmounts,
		refreshDisabled,
		reserves,
		setReserves,
		srcToken,
		destToken,
		setSrcToken,
		setDestToken,
		srcTokenObj,
		destTokenObj,
		isReversed,
		setIsReversed,
		inputValue,
		setInputValue,
		outputValue,
		setOutputValue,
		address,
	} = usePools();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [signerBalances, setSignerBalances] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [transactionMessage, setTransactionMessage] = useState("");

	const handleRefresh = () => {
		refreshAmounts();
	};
	const handleAddLiquidity = async (
		tokenAAmount,
		tokenBAmount,
		setTransactionMessage
	) => {
		try {
			const { token0, token1, reverse } = reserves;
			setTransactionMessage(`Step 1/4: Deposit ETH...`);

			console.log(
				srcTokenObj.defaultValue === WETH
					? srcTokenObj.value
					: destTokenObj.value
					? destTokenObj.value
					: 0
			);
			const wrapReceipt = await wrapEth(
				srcTokenObj.defaultValue === WETH
					? srcTokenObj.value
					: destTokenObj.defaultValue === WETH
					? destTokenObj.value
					: 0
			);
			console.log("eth wrapped succesfully", wrapReceipt);

			setTransactionMessage(
				(prev) =>
					`${prev} done.<br />Step 2/4: Granting ${srcTokenObj.defaultValue} allowance...`
			);
			const allowanceA = await increaseAllowance(tokenAAmount, srcToken);
			if (!allowanceA) {
				setIsLoading(false);
				setIsModalOpen(false);
				// notifyError("Transaction failed");

				return;
			}
			setTransactionMessage(
				(prev) =>
					`${prev} done.<br />Step 3/4: Granting ${destTokenObj.defaultValue} allowance...`
			);
			const allowanceB = await increaseAllowance(tokenBAmount, destToken);
			setTransactionMessage(
				(prev) => `${prev} done. <br />Step 4/4: Adding liquidity...`
			);
			console.log("****************************",token0,
				token1,
				reverse ? tokenBAmount : tokenAAmount,
				reverse ? tokenAAmount : tokenBAmount,
				0,
				0);
			
			const receipt = await addLiquidity(
				
				token0,
				token1,
				reverse ? tokenBAmount : tokenAAmount,
				reverse ? tokenAAmount : tokenBAmount,
				0,
				0
			);
			console.log("liquidity added", receipt);
			
			setTransactionMessage((prev) => `${prev} done.`);
		} catch (error) {
			console.log(error);
		}

		setIsModalOpen(false);
		handleRefresh();
	};

	const handleRemoveLiquidity = async (
		amount,
		signerLpBalance,
		removePercentage
	) => {
		console.log(reserves);
		const lpAmount = removePercentage === 100 ? signerLpBalance : amount;

		try {
			const { address, token0, token1 } = reserves;
			setTransactionMessage(`Step 1/3: Granting VINI token allowance...`);

			const allowance = await lpTokenAllowance({
				liquidityAmount: lpAmount,
				address,
			});

			if (!allowance) {
				setIsLoading(false);
				setIsModalOpen(false);
				// notifyError("Transaction failed");
				return;
			}

			await allowance.wait();
			console.log("allowance granted to remove", lpAmount, allowance);

			setTransactionMessage(
				(prev) => `${prev} done.<br />Step 2/3: Removing liquidity...`
			);

			const receipt = await removeLiquidity(token0, token1, lpAmount);

			if (!receipt) {
				setIsLoading(false);
				setIsModalOpen(false);
				// notifyError("Transaction failed");
				return;
			}
			console.log("liquidity successfully removed ", receipt);
			setTransactionMessage(
				(prev) => `${prev} done.<br />Step 3/3: Withdrawing ETH...`
			);
			const afterRemoveWethBalance = await wethBalance();
			console.log(afterRemoveWethBalance);
			console.log("Withdrawing Eth...");

			const witdrawReceipt = await unwrapEth();
			if (!witdrawReceipt) {
				setIsLoading(false);
				setIsModalOpen(false);
				notifyError(
					"Liquidity removal succeded, but ETH not withdrawn. Please withdraw your ETH manually"
				);
				return;
			}

			console.log("successfully unwrapped eth", witdrawReceipt);
			// notifySuccess("Liquidity removed successfully!");
		} catch (error) {
			console.log(error);
		}
		setIsModalOpen(false);

		handleRefresh();
	};

	const [swapBtnText, setSwapBtnText] = useState(ENTER_AMOUNT);
	const [txPending, setTxPending] = useState(false);

	const getPoolReserves = ({ srcToken, destToken }) => {
		const isWhitelisted = pairIsWhitelisted(
			srcToken.address,
			destToken.address
		);

		console.log("*********************************", srcToken, destToken);

		let poolData;
		if (isWhitelisted && address) {
			console.log(
				`Pair (${srcToken.address}, ${destToken.address}) is whitelisted`
			);

			setSwapBtnText(ADD_OR_REMOVE_LIQUIDITY);
			console.log(pools);
			const pool = pools.find(
				(pool) =>
					(pool.token0 === srcToken.address &&
						pool.token1 === destToken.address) ||
					(pool.token0 === destToken.address &&
						pool.token1 === srcToken.address)
			);
			console.log(
				"pool /////////////////////////////////////////////////////",
				pool
			);

			const reverse = pool?.token0 !== srcToken?.address;
			poolData = { ...pool, reverse: reverse };
			console.log(poolData);
			setReserves(poolData);
		} else {
			console.log(
				`Pair (${srcToken.address}, ${destToken.address}) is not whitelisted`
			);

			if (!address) setSwapBtnText(CONNECT_WALLET);
			else setSwapBtnText(SELECT_PAIR);
			setReserves({});
			return;
		}

		return poolData;
	};

	useEffect(() => {
		if (!address) setSwapBtnText(CONNECT_WALLET);
		else if (!inputValue || !outputValue) setSwapBtnText(SELECT_PAIR);
	}, [inputValue, outputValue, address]);

	useEffect(() => {
		const getReserves = async () => {
			const srcTokenAddress = getCoinAddress(srcToken);
			const destTokenAddress = getCoinAddress(destToken);
			const reserves = getPoolReserves({ srcToken, destToken });
			console.log("reserves", reserves);
			if (inputValue.length === 0) setOutputValue("");
		};

		getReserves();
	}, [
		destToken,
		srcToken,
		setDestToken,
		setSrcToken,
		refresh,
		refreshDisabled,
	]);

	const handleOpenModal = () => {
		getBalances(srcToken, destToken, reserves)
			.then((balances) => {
				setSignerBalances({ ...balances });
			})
			.catch((error) => {
				console.error(error);
			});
		setIsModalOpen(true);
	};

	return (
		<div className='p-4 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900 mt-20 text-white '>
			<div className='flex md:px-4'>
				<NavItems />
			</div>
			<div className='flex items-center justify-between  px-1 my-4'>
				<p>Liquidity Pool</p>
				<div className='flex flex-row '>
					<FiRefreshCcw
						className='h-6 mr-2'
						style={
							refreshDisabled
								? { cursor: "not-allowed", opacity: 0.2 }
								: { cursor: "pointer" }
						}
						onClick={handleRefresh}
					/>
					{/* <CogIcon className="h-6" style={{ cursor: "pointer" }} /> */}
				</div>
			</div>

			<div className='flex bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600'>
				<PoolField obj={srcTokenObj} />
			</div>

			<div className='bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600'>
				<PoolField obj={destTokenObj} />
			</div>

			<button
				className={getSwapBtnClassName()}
				onClick={() => {
					if (swapBtnText === ADD_OR_REMOVE_LIQUIDITY) handleOpenModal();
					// setIsModalOpen(true);
					else if (swapBtnText === CONNECT_WALLET) openConnectModal();
				}}
			>
				{swapBtnText}
			</button>

			{txPending && <TransactionStatus />}

			<Toaster />

			<LiquidityModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onAddLiquidity={handleAddLiquidity}
				onRemoveLiquidity={handleRemoveLiquidity}
				srcToken={srcToken}
				destToken={destToken}
				signerBalances={signerBalances}
				reserves={reserves}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				transactionMessage={transactionMessage}
				setTransactionMessage={setTransactionMessage}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
			/>
		</div>
	);
};

export default Pool;
