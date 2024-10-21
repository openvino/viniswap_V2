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
	getSwapBtnClassName,
	notifyError,
	notifySuccess,
} from "../utils/swap-utils";
import { CogIcon } from "@heroicons/react/outline";
import { CgArrowsExchangeV } from "react-icons/cg";
import SwapField from "./SwapField";
import TransactionStatus from "./TransactionStatus";
import { DEFAULT_VALUE, getCoinAddress } from "../utils/SupportedCoins";
import NavItems from "./NavItems";
import SwapOptions from "./swapOptions";
import useSwaps from "../hooks/useSwaps";
import { pairIsWhitelisted } from "../utils/pools-utils";
import { baseSepolia } from "thirdweb/chains";
import useWeb3Store from "../zustand/store";
import {
	useActiveAccount,
	useSendBatchTransaction,
	useConnectedWallets,
	useSetActiveWallet,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "../config/thirdwebClient";
import { wethABI } from "../utils/abi";
import { toEth, toWei } from "../utils/ether-utils";
import { ethers } from "ethers";
import { getPairAddress } from "../utils/whitelistedPools";
import { pairContract, routerContract } from "../utils/contract";
import { useActiveWallet } from "thirdweb/react";
import WalletModal from "./Modals/WalletModal";

const Swap = () => {
	const smartAccount = useActiveAccount();
	const wallet = useActiveWallet();
	const wallets = useConnectedWallets();
	const {
		mutate: sendBatch,
		data: transactionResult,
		isPending,
		error,
	} = useSendBatchTransaction();
	const setActiveAccount = useSetActiveWallet();

	const [isOpenModalWallet, setIsOpenModalWallet] = useState(false);
	const [showedUserWalletSelected, setShowedUserWalletSelected] =
		useState(false);

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
		setSlippage,
		swapBtnText,
		setSwapBtnText,
		txPending,
		setTxPending,
		isReversed,
		srcTokenObj,
		destTokenObj,
		price,
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

	useEffect(() => {
		if (smartAccount?.address && !showedUserWalletSelected) {
			setIsOpenModalWallet(true);
			setShowedUserWalletSelected(true);
		}
	}, [smartAccount?.address]);

	const performSwap = async () => {
		setTxPending(true);
		try {
			const provider = useWeb3Store.getState().provider;
			const signer = useWeb3Store.getState().signer;

			// Instanciar el contrato de WETH con el signer
			const wethContract = new ethers.Contract(
				process.env.NEXT_PUBLIC_WETH_ADDRESS,
				wethABI,
				signer
			);

			// Instancia del par
			console.log(
				process.env.NEXT_PUBLIC_MTB24_ADDRESS,
				process.env.NEXT_PUBLIC_WETH_ADDRESS
			);

			const pairAddress = getPairAddress([
				process.env.NEXT_PUBLIC_MTB24_ADDRESS,
				process.env.NEXT_PUBLIC_WETH_ADDRESS,
			]);
			console.log(pairAddress);

			const exactTokenAmount = Math.floor(outputValue);

			// Instancia del router
			const routerObj = await routerContract();
			if (!routerObj) {
				throw new Error("No se pudo obtener el contrato del router");
			}

			// Instancia del par y reservas
			// const pairContractObj = await pairContract(pairAddress);
			const pairContractObj = await pairContract(
				"0xEAe841D5EfFeD2210e087A7e6F06993fb6fe85d0"
			);
			const reserves = await pairContractObj.getReserves();
			const reserveOut = reserves[0];
			const reserveIn = reserves[1];

			// Balance inicial
			const initialTokenBalance = await tokenBalance();
			const initialWethBalance = await wethBalance();

			const amount = ethers.BigNumber.from(toWei(outputValue));

			console.log(amount, reserveIn, reserveOut);

			console.log(routerObj);

			const amountIn = await routerObj.getAmountIn(
				amount,
				reserveIn,
				reserveOut
			);
			console.log(amountIn);

			const amountSlippage = amountIn.mul(120).div(100);
			const finalAmountBN = ethers.utils.parseUnits(
				amountSlippage.toString(),
				"wei"
			);

			const finalAmount = finalAmountBN.toString();

			// Identificar si es una smart wallet
			const smartWallet = wallets.find((wallet) => wallet.id === "smart");
			const isSmartWallet = smartWallet && wallet.id === "smart";

			if (isSmartWallet) {
				// Verificar el balance de la smart wallet
				const smartWalletAddress = smartWallet.getAccount().address;
				const balance = await provider.getBalance(smartWalletAddress);
				console.log(balance, "balance");

				if (balance.lt(finalAmount)) {
					notifyError(
						"Insufficient funds in the smart wallet, please select a different wallet."
					);
					setIsOpenModalWallet(true);
					return;
				}

				// Si es una smart wallet, ejecutar las transacciones en batch
				const wrapEthTx = {
					to: process.env.NEXT_PUBLIC_WETH_ADDRESS,
					data: wethContract.interface.encodeFunctionData("deposit"),
					value: finalAmount,
					chain: baseSepolia,
				};

				const approvalTx = {
					to: process.env.NEXT_PUBLIC_WETH_ADDRESS,
					data: wethContract.interface.encodeFunctionData("approve", [
						routerObj.address,
						finalAmountBN.toString(),
					]),
					chain: baseSepolia,
				};

				const swapTx = {
					to: routerObj.address,
					data: routerObj.interface.encodeFunctionData(
						"swapTokensForExactTokens",
						[
							toWei(outputValue),
							toWei(initialWethBalance),
							[
								process.env.NEXT_PUBLIC_WETH_ADDRESS,
								process.env.NEXT_PUBLIC_MTB24_ADDRESS,
							],
							smartWalletAddress,
							Math.floor(Date.now() / 1000) + 60 * 10,
						]
					),
					chain: baseSepolia,
				};

				await sendBatch([wrapEthTx, approvalTx, swapTx]);

				notifySuccess("eskere");
			} else {
				// Si no es una smart wallet, ejecutar las transacciones independientes

				// 1. Envolver ETH a WETH
				const wrapTx = await wethContract.deposit({
					value: finalAmountBN.toString(),
				});
				await wrapTx.wait();

				// 2. Aprobar el gasto de WETH
				const approveTx = await wethContract.approve(
					routerObj.address,
					finalAmountBN.toString()
				);
				await approveTx.wait();

				// 3. Realizar el swap
				const swapTx = await routerObj.swapTokensForExactTokens(
					toWei(outputValue),
					toWei(initialWethBalance),
					[
						process.env.NEXT_PUBLIC_WETH_ADDRESS,
						process.env.NEXT_PUBLIC_MTB24_ADDRESS,
					],
					signer.getAddress(), // Dirección del usuario
					Math.floor(Date.now() / 1000) + 60 * 10
				);
				await swapTx.wait();
				notifySuccess("eskere 2");
			}
		} catch (error) {
			notifyError(error.message);
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
		<div className="p-4 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900 mt-20 text-white">
			<div className="flex md:px-4">
				<NavItems />
			</div>

			<WalletModal open={isOpenModalWallet} onClose={setIsOpenModalWallet} />

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
