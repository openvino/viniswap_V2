import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
	ConnectButton,
	useActiveAccount,
	useActiveWallet,
	useConnectedWallets,
	useSendBatchTransaction,
} from "thirdweb/react";
import { optimismSepolia } from "thirdweb/chains";
import { accountAbstraction, client } from "../config/thirdwebClient";
import useWeb3Store from "../zustand/store";
import { tokens } from "../utils/bridgeTokens";
import { ethers } from "ethers";
import { mtbABI } from "../utils/abi";
import Spinner from "./spinner";
const Header = () => {
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const wallets = useConnectedWallets();
	console.log(account?.address);
	const [disabledTokens, setDisabledTokens] = useState([]);
	const [validTokens, setValidTokens] = useState([]);
	const {
		mutate: sendBatch,
		data: transactionResult,
		isPending,
		error,
	} = useSendBatchTransaction();
	const cutoffDate = new Date("2024-11-01T00:00:00Z").getTime();
	const [claiming, setClaiming] = useState(false);

	const performBurnAndMint = async () => {
		console.log("performing Burn and Mint");

		try {
			const provider = useWeb3Store.getState().provider;
			const signer = useWeb3Store.getState().signer;

			const minter = "0xdF258287f4f0C75A630Eba449326D722b6b02e0c"; // Dirección del contrato Minter
			const burnABI = ["function burn(uint256 amount)"]; // ABI para el método burn
			const minterABI = [
				"function mint(address token, address recipient, uint256 amount)",
			]; // ABI para el método mint

			const smartWallet = wallets.find((wallet) => wallet.id === "smart");
			const isSmartWallet = smartWallet && wallet.id === "smart";
			const walletAddress = await signer.getAddress();

			const transactions = [];
			for (let { tokenAddress, balance } of validTokens) {
				const amount = balance;

				//burn
				const tokenContract = new ethers.Contract(tokenAddress, mtbABI, signer);
				const burnTx = {
					to: tokenAddress,
					data: tokenContract.interface.encodeFunctionData("burn", [amount]),
					chain: "optimismSepolia",
				};

				//  mint
				const minterContract = new ethers.Contract(minter, minterABI, signer);
				const mintTx = {
					to: minter,
					data: minterContract.interface.encodeFunctionData("mint", [
						tokenAddress,
						walletAddress,
						amount,
					]),
					chain: "optimismSepolia",
				};

				// Si es smart wallet, agregar transacciones al batch
				if (isSmartWallet) {
					transactions.push(burnTx, mintTx);
				} else {
					// En caso de no ser smart wallet, ejecutar las transacciones individualmente
					console.log(`Executing burn for token ${tokenAddress}`);
					const burnTx = await tokenContract.burn(amount);
					await burnTx.wait();
					console.log(`Burn transaction confirmed: ${burnTx.hash}`);

					console.log(`Executing mint for token ${tokenAddress}`);
					const mintTx = await minterContract.mint(
						tokenAddress,
						walletAddress,
						amount
					);
					await mintTx.wait();
					console.log(`Mint transaction confirmed: ${mintTx.hash}`);
				}
			}

			// Ejecutar el batch si es una smart wallet
			if (isSmartWallet) {
				await sendBatch(transactions);
				setTimeout(() => {
					setClaiming(false);
					setLoading(false);
				}, 5000);
				console.log("Batch burn and mint transactions completed successfully");
			}
		} catch (error) {
			console.error("Error in performBurnAndMint:", error);
		}
		setTimeout(() => {
			setClaiming(false);
			setLoading(false);
		}, 1000);
	};

	//OK
	// const performBurnAndMint = async (validTokensList) => {
	// 	console.log("performing Burn and Mint");

	// 	try {
	// 		const provider = useWeb3Store.getState().provider;
	// 		const signer = useWeb3Store.getState().signer;

	// 		const minter = "0xdF258287f4f0C75A630Eba449326D722b6b02e0c"; // Dirección del contrato Minter
	// 		const burnABI = ["function burn(uint256 amount)"]; // ABI para el método burn
	// 		const minterABI = [
	// 			"function mint(address token, address recipient, uint256 amount)",
	// 		]; // ABI para el método mint

	// 		const smartWallet = wallets.find((wallet) => wallet.id === "smart");
	// 		const isSmartWallet = smartWallet && wallet.id === "smart";
	// 		const walletAddress = await signer.getAddress();

	// 		const transactions = [];
	// 		for (let { tokenAddress, balance } of validTokensList) {
	// 			const amount = balance;

	// 			//burn
	// 			const tokenContract = new ethers.Contract(tokenAddress, mtbABI, signer);
	// 			const burnTx = {
	// 				to: tokenAddress,
	// 				data: tokenContract.interface.encodeFunctionData("burn", [amount]),
	// 				chain: "optimismSepolia",
	// 			};

	// 			//  mint
	// 			const minterContract = new ethers.Contract(minter, minterABI, signer);
	// 			const mintTx = {
	// 				to: minter,
	// 				data: minterContract.interface.encodeFunctionData("mint", [
	// 					tokenAddress,
	// 					walletAddress,
	// 					amount,
	// 				]),
	// 				chain: "optimismSepolia",
	// 			};

	// 			// Si es smart wallet, agregar transacciones al batch
	// 			if (isSmartWallet) {
	// 				transactions.push(burnTx, mintTx);
	// 			} else {
	// 				// En caso de no ser smart wallet, ejecutar las transacciones individualmente
	// 				console.log(`Executing burn for token ${tokenAddress}`);
	// 				const burnTx = await tokenContract.burn(amount);
	// 				await burnTx.wait();
	// 				console.log(`Burn transaction confirmed: ${burnTx.hash}`);

	// 				console.log(`Executing mint for token ${tokenAddress}`);
	// 				const mintTx = await minterContract.mint(
	// 					tokenAddress,
	// 					walletAddress,
	// 					amount
	// 				);
	// 				await mintTx.wait();
	// 				console.log(`Mint transaction confirmed: ${mintTx.hash}`);
	// 			}
	// 		}

	// 		// Ejecutar el batch si es una smart wallet
	// 		if (isSmartWallet) {
	// 			await sendBatch(transactions);
	// 			console.log("Batch burn and mint transactions completed successfully");
	// 		}
	// 	} catch (error) {
	// 		console.error("Error in performBurnAndMint:", error);
	// 	}
	// };
	//
	const [loading, setLoading] = useState(false);
	// useEffect(() => {
	// 	setClaiming(false);
	// 	const processUserTokensData = async () => {
	// 		if (!account || !account.address) {
	// 			return;
	// 		}

	// 		const provider = useWeb3Store.getState().provider;
	// 		const signer = useWeb3Store.getState().signer;
	// 		let validTokensList = [];
	// 		let disabledTokensList = [];

	// 		for (let tokenAddress of tokens) {
	// 			const tokenContract = new ethers.Contract(
	// 				tokenAddress,
	// 				mtbABI,
	// 				provider
	// 			);

	// 			const balance = await tokenContract.balanceOf(account.address);
	// 			console.log(
	// 				`Balance of ${tokenAddress}: ${ethers.utils.formatUnits(balance, 18)}`
	// 			);

	// 			const filter = tokenContract.filters.Transfer(null, account.address);
	// 			const events = await tokenContract.queryFilter(filter);
	// 			console.log("events", events);

	// 			let receivedAfterCutoff = false;
	// 			for (let event of events) {
	// 				const block = await provider.getBlock(event.blockNumber);
	// 				const timestamp = block.timestamp * 1000;

	// 				if (timestamp >= cutoffDate) {
	// 					receivedAfterCutoff = true;
	// 				}
	// 			}

	// 			if (receivedAfterCutoff) {
	// 				disabledTokensList.push({ tokenAddress, balance });
	// 			} else {
	// 				validTokensList.push({ tokenAddress, balance });
	// 				if (balance) setLoading(true);
	// 			}
	// 		}

	// 		setDisabledTokens(disabledTokensList);
	// 		setValidTokens(validTokensList);

	// 		console.log(
	// 			"finished processing current user tokens",
	// 			validTokensList.filter((token) => token?.balance > 0)
	// 		);
	// 		if (validTokensList.filter((token) => token?.balance > 0).length > 0)
	// 			setClaiming(true);
	// 		else setClaiming(false);
	// 		setLoading(false);
	// 		// performBurnAndMint(validTokensList);
	// 	};

	// 	account && processUserTokensData();
	// }, [account]);

	return (
		<div className="fixed left-0 top-0 w-full    items-center  ">
			<div className="flex items-center justify-between  ">
				<div className="flex flex-col my-4 w-full justify-between px-2 md:px-16">
					<div className="flex items-center justify-between ">
						<img src="./mtb.png" className="h-12" />

						<div className="flex rounded-3xl">
							<ConnectButton
								client={client}
								locale="es_ES"
								accountAbstraction={accountAbstraction}
								connectModal={{
									size: "compact",
									title: "Viniswap",
									welcomeScreen: {
										title: "eskere",
										img: "/mtb.png",
									},
								}}
								connectButton={{
									label: "Connect Wallet",
									style: {
										padding: "12px 24px",
										background: "#000",
										color: "#fff",
										fontSize: "16px",
										fontWeight: "bold",
										borderRadius: "12px",
										boxShadow:
											"0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
									},
								}}
							/>
						</div>
					</div>
				</div>

				<Toaster />
			</div>
			{account?.address && (loading || claiming) && (
				<>
					<div className="flex items-center justify-center mt-[-1rem]">
						<div className="rounded-xl p-3 text-center w-fit shadow-md">
							<div className="flex items-center justify-center mb-2">
								{account && loading && !claiming && (
									<h3 className="text-l font-semibold text-black">
										We moved to BASE! Checking your balances...
									</h3>
								)}
								{account && !loading && claiming && (
									<h3 className="text-l font-semibold text-black">
										WELCOME to BASE!
									</h3>
								)}
							</div>
							<div className="flex items-center justify-center">
								{account && !loading && claiming && (
									<button
										className="bg-black text-white py-1 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300"
										onClick={performBurnAndMint}
									>
										CLAIM YOUR TOKENS NOW!
									</button>
								)}
								{account && loading && (
									<div className="flex items-center justify-center h-[2rem] w-[2rem] ml-4">
										<div
											style={{
												border: "4px solid rgba(0, 0, 0, 0.1)",
												borderLeftColor: "#ffffff",
												borderRadius: "50%",
												width: "2rem",
												height: "2rem",
												animation: "spin 1s linear infinite",
											}}
										></div>
									</div>
								)}
								<style>
									{`
										@keyframes spin {
											to { transform: rotate(360deg); }
										}
									`}
								</style>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Header;
