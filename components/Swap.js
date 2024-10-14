import React, { useEffect, useState, useRef } from "react";
import {
	getTokenPrice,
	increaseTokenAllowance,
	increaseWethAllowance,
	swapTokensToWeth,
	swapWethToTokens,
	swapWethToTokensBatch,
	tokenAllowance,
	tokenBalance,
	unwrapEth,
	wethAllowance,
	wethBalance,
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
import { useActiveAccount, useSendBatchTransaction, } from "thirdweb/react";
import { getContract } from "thirdweb";
import { deposit, withdraw, approve } from "thirdweb/extensions/erc20";
import { chain, client, thirdwebWethContract } from "../config/thirdwebClient";
import { wethABI } from "../utils/abi";
import { toEth, toWei } from "../utils/ether-utils";
import { ethers } from "ethers";
import { getPairAddress } from "../utils/whitelistedPools";
import { pairContract, routerContract } from "../utils/contract";

import { useActiveWallet } from "thirdweb/react";
 
const Swap = () => {

	const smartAccount = useActiveAccount();
	const wallet = useActiveWallet();

	const { mutate: sendBatch, data: transactionResult, isPending, error } = useSendBatchTransaction();

	const contractWeth = getContract({
		client: client,
		chain: optimismSepolia,
		address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
		abi: wethABI
	})

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

	useEffect(() => {
		const isWhiteListed = pairIsWhitelisted(
			getCoinAddress(srcToken),
			getCoinAddress(destToken)
		);

		if (!address) setSwapBtnText(CONNECT_WALLET);
		// else if (chain?.id !== 11155111) setSwapBtnText(SWITCH_NETWORK);
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
	}, [inputValue, outputValue, address, srcToken, destToken, isReversed]);

	useEffect(() => {
		setInputValue("");
		setOutputValue("");
	}, []);

	wallet?.subscribe("accountChanged", (account) => {
		console.log(account);
	  });



	// const performSwap = async () => {
	// 	setTxPending(true);
	// 	try {
	// 		let receipt;

	// 		if (srcToken === WETH && destToken !== WETH) {
	// 			// receipt = await swapWethToTokens(outputValue);
	// 			receipt = await swapWethToTokensBatch(outputValue,sendBatch, transactionResult);
	// 			if (!receipt) {
	// 				throw new Error("Transaction failed");
	// 			}
	// 			notifySuccess("Swap completed succesfully!");
	// 			return;
	// 		} else if (srcToken !== WETH && destToken === WETH) {
	// 			receipt = await swapTokensToWeth(inputValue);
	// 			if (!receipt) {
	// 				throw new Error("Transaction failed");
	// 			}
	// 			console.log("swap succesful", receipt);

	// 			setInputValue("");
	// 			setOutputValue("");
	// 		}

	// 		if (receipt && !receipt.hasOwnProperty("transactionHash")) {
	// 			notifyError(receipt);
	// 		} else {
	// 			notifySuccess();
	// 		}
	// 	} catch (error) {
	// 		console.log(error);
	// 		// notifyError("Transaction failed");
	// 	}
	// };

	const performSwap = async () => {
		
		setTxPending(true);

		console.log(wallet);

	
		
		try {
			const provider = useWeb3Store.getState().provider;
			const signer = provider.getSigner();

			console.log(provider);
			console.log(signer);

			return

			// Instanciar el contrato de WETH con el signer
			const wethContract = new ethers.Contract(
				process.env.NEXT_PUBLIC_WETH_ADDRESS,
				wethABI,
				signer
			);

			//instancia del par
			const pairAddress = getPairAddress([process.env.NEXT_PUBLIC_MTB24_ADDRESS, process.env.NEXT_PUBLIC_WETH_ADDRESS]);
			// console.log(pairAddress, "pairAddress");

			const exactTokenAmount = Math.floor(outputValue);
			// console.log(exactTokenAmount);

			//instancia del router 
			const routerObj = await routerContract();
			if (!routerObj) {
				throw new Error("No se pudo obtener el contrato del router");
			}

			//instancia del par y reservas
			const pairContractObj = await pairContract(pairAddress);
			const reserves = await pairContractObj.getReserves();
			const reserveOut = reserves[1];
			const reserveIn = reserves[0];
			// console.log(toWei(toEth(reserveOut)), toWei(toEth(reserveIn)));

			//Balance inicial
			const initialTokenBalance = await tokenBalance();
			const initialWethBalance = await wethBalance();

			const amount = ethers.BigNumber.from(toWei(outputValue));

			const amountIn = await routerObj.getAmountIn(amount, reserveIn, reserveOut); // Price
			console.log(toEth(amountIn), "amountIn");

			const amountSlippage = amountIn.mul(120).div(100);
			const finalAmountBN = ethers.utils.parseUnits(
				amountSlippage.toString(),
				"wei"
			);

			const finalAmount = finalAmountBN.toString();

			//Objeto para el batch
			const wrapEthTx = {
				to: process.env.NEXT_PUBLIC_WETH_ADDRESS,
				data: wethContract.interface.encodeFunctionData("deposit"),
				value: finalAmount,
				chain: optimismSepolia
			};
			//Increase Allowance
			const approvalTx = {
				to: process.env.NEXT_PUBLIC_WETH_ADDRESS,
				data: wethContract.interface.encodeFunctionData("approve", [
					routerObj.address,
					finalAmountBN.toString()
				]),
				chain: optimismSepolia
			}

			//Swap
			const swapTx = {
				to: routerObj.address,
				data: routerObj.interface.encodeFunctionData("swapTokensForExactTokens", [
					toWei(outputValue),
					toWei(initialWethBalance),
					[
						process.env.NEXT_PUBLIC_WETH_ADDRESS,
						process.env.NEXT_PUBLIC_MTB24_ADDRESS
					],
					"0x2E54D912361f6A4b1e57E239138Ff4C1344940Ae",
					Math.floor(Date.now() / 1000) + 60 * 10
				]),
				chain: optimismSepolia

			}
			await sendBatch([wrapEthTx, approvalTx, swapTx]);
			
		} catch (error) {
			console.log("Error al realizar el swap:", error);
		} finally {
			setTxPending(false);
		}
	};


	useEffect(() => {
		console.log(error);

	}, [error]);

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
	}

	return (
		<div className='p-4 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900 mt-20 text-white'>
			<div className='flex md:px-4'>
				<NavItems />
			</div>

			<div className='flex items-center justify-between px-1 my-4'>
				<p>Swap</p>

				{swapOptionsOpen ? (
					<SwapOptions
						setSlippage={setSlippage}
						setSwapOptionsOpen={setSwapOptionsOpen}
					/>
				) : (
					<CogIcon
						className='h-6 cursor-pointer'
						onClick={() => setSwapOptionsOpen(true)}
					/>
				)}
			</div>
			<div className='flex bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600'>
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
					className='fixed left-1/2 -translate-x-1/2 -translate-y-[-120%] text-[4rem] justify-center  h-10 p-1 bg-[#212429] border-4 border-zinc-900 text-zinc-300 rounded-xl cursor-pointer hover:scale-110'
					onClick={handleReverseExchange}
				/>
			</div>

			<div className='bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600'>
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
					if (swapBtnText === SWAP) handleSwap();
					else if (swapBtnText === CONNECT_WALLET) openConnectModal();
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
