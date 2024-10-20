import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
	ConnectButton,
	TransactionButton,
	useActiveAccount,
	useActiveWallet,
	useConnectedWallets,
	useSendBatchTransaction,
} from "thirdweb/react";
import { optimismSepolia } from "thirdweb/chains";
import { accountAbstraction, client } from "../config/thirdwebClient";
import { getContract, prepareContractCall } from "thirdweb";
import { toWei } from "../utils/ether-utils";
import { ethers } from "ethers";
import useWeb3Store from "../zustand/store";
import { erc20ABI, mtbABI } from "../utils/abi";
import { tokens } from "../utils/bridgeTokens";

const Header = () => {
	const [tokenBalComp, setTokenBalComp] = useState();
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
	const performBurnAndMint = async (validTokensList) => {
		console.log("performing Burn and Mint");

		try {
			const provider = useWeb3Store.getState().provider;
			const signer = useWeb3Store.getState().signer;

			const minter = "0xdF258287f4f0C75A630Eba449326D722b6b02e0c"; // Dirección del contrato Minter
			const burnABI = ["function burn(uint256 amount)"]; // ABI para el método burn
			const minterABI = [
				"function mint(address token, address recipient, uint256 amount)",
			]; // ABI para el método mint

			// Verificar si es una smart wallet
			const smartWallet = wallets.find((wallet) => wallet.id === "smart");
			const isSmartWallet = smartWallet && wallet.id === "smart";
			const walletAddress = await signer.getAddress();

			const transactions = [];

			// Iterar sobre los tokens válidos
			for (let { tokenAddress, balance } of validTokensList) {
				const amount = balance;

				// Preparar la transacción de quema (burn)
				const tokenContract = new ethers.Contract(
					tokenAddress,
					burnABI,
					signer
				);
				const burnData = tokenContract.interface.encodeFunctionData("burn", [
					amount,
				]);

				// Preparar la transacción de minteo (mint)
				const minterContract = new ethers.Contract(minter, minterABI, signer);
				const mintData = minterContract.interface.encodeFunctionData("mint", [
					tokenAddress,
					walletAddress,
					amount,
				]);

				// Si es smart wallet, agregar transacciones al batch
				if (isSmartWallet) {
					const burnTx = {
						to: tokenAddress,
						data: burnData,
					};
					const mintTx = {
						to: minter,
						data: mintData,
					};
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
				const batch = await sendBatch(transactions);
				console.log(
					"Batch burn and mint transactions completed successfully",
					batch
				);
			}
		} catch (error) {
			console.error("Error in performBurnAndMint:", error);
		}
	};
	// const performBurnAndMint = async () => {
	// 	if (!account?.address) return;
	// 	console.log("performing Burn and Mint");
	// 	console.log(validTokens);

	// 	try {
	// 		const provider = useWeb3Store.getState().provider;
	// 		const signer = useWeb3Store.getState().signer;

	// 		const minter = "0xdF258287f4f0C75A630Eba449326D722b6b02e0c";
	// 		const burnABI = ["function burn(uint256 amount)"]; // ABI para el método burn
	// 		const minterABI = [
	// 			"function mint(address token, address recipient, uint256 amount)",
	// 		]; // ABI para el método mint

	// 		// Verificar si es una smart wallet
	// 		const smartWallet = wallets.find((wallet) => wallet.id === "smart");
	// 		const isSmartWallet = smartWallet && wallet.id === "smart";
	// 		const walletAddress = await signer.getAddress();

	// 		const transactions = [];

	// 		// Iterar sobre los tokens válidos
	// 		for (let { tokenAddress, balance } of validTokens) {
	// 			const amount = balance;

	// 			// Preparar la transacción de quema (burn)
	// 			const tokenContract = new ethers.Contract(
	// 				tokenAddress,
	// 				burnABI,
	// 				signer
	// 			);
	// 			const burnData = tokenContract.interface.encodeFunctionData("burn", [
	// 				amount,
	// 			]);

	// 			// Preparar la transacción de minteo (mint)
	// 			const minterContract = new ethers.Contract(minter, minterABI, signer);
	// 			const mintData = minterContract.interface.encodeFunctionData("mint", [
	// 				tokenAddress,
	// 				walletAddress,
	// 				amount,
	// 			]);

	// 			// Si es smart wallet, agregar transacciones al batch
	// 			if (isSmartWallet) {
	// 				const burnTx = {
	// 					to: tokenAddress,
	// 					data: burnData,
	// 				};
	// 				const mintTx = {
	// 					to: minter,
	// 					data: mintData,
	// 				};
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
	// 			const batch = await sendBatch(transactions);
	// 			console.log(
	// 				"Batch burn and mint transactions completed successfully",
	// 				batch
	// 			);
	// 		}
	// 	} catch (error) {
	// 		console.error("Error in performBurnAndMint:", error);
	// 	}
	// };
	useEffect(() => {
		setClaiming(false);
		const processUserTokensData = async () => {
			if (!account || !account.address) {
				return;
			}

			const provider = useWeb3Store.getState().provider;
			const signer = useWeb3Store.getState().signer;
			let validTokensList = [];
			let disabledTokensList = [];

			for (let tokenAddress of tokens) {
				const tokenContract = new ethers.Contract(
					tokenAddress,
					erc20ABI,
					provider
				);

				const balance = await tokenContract.balanceOf(account.address);
				console.log(
					`Balance of ${tokenAddress}: ${ethers.utils.formatUnits(balance, 18)}`
				);

				const filter = tokenContract.filters.Transfer(null, account.address);
				const events = await tokenContract.queryFilter(filter);
				console.log("events", events);

				let receivedAfterCutoff = false;
				for (let event of events) {
					const block = await provider.getBlock(event.blockNumber);
					const timestamp = block.timestamp * 1000;

					if (timestamp >= cutoffDate) {
						receivedAfterCutoff = true;
					}
				}

				if (receivedAfterCutoff) {
					disabledTokensList.push({ tokenAddress, balance });
				} else {
					validTokensList.push({ tokenAddress, balance });
				}
			}

			setDisabledTokens(disabledTokensList);
			setValidTokens(validTokensList);

			console.log("finished processing current user tokens");
			if (validTokensList.length > 0) setClaiming(true);
			else setClaiming(false);
			performBurnAndMint(validTokensList);
		};

		account && processUserTokensData();
	}, [account]);

	return (
		<div className="fixed left-0 top-0 w-full    items-center  ">
			<div className="flex items-center justify-between  ">
				<div className="flex flex-col my-4 w-full justify-between px-2 md:px-16">
					<div className="flex items-center justify-between ">
						<img src="./mtb.png" className="h-12" />

						<div className="flex rounded-3xl">
							{/* <TransactionButton
								transaction={async () => {
									// Dirección del contrato del token que será minteado
									const tokenToMintContract =
										"0x5F9399A2d94e70990C486062c1F2dA9D08A3E14c";
									// const tokenToMintContract =
									// "0x435b322121f0918B14A057A986e55A1909e447f1";
									// const tokenToMintContract =
									// "0xfE60f87909fDAC634cf8ceCE8D64D0af1653a826";
									// const tokenToMintContract =
									// 	"0x39e0aC93CDCa493c850836bC0baB9Df25305Cd2d";
									// const tokenToMintContract =
									// 	"0x538077E0EaE2C9B4E83967c8204154090ac81398";

									const minter = "0xdF258287f4f0C75A630Eba449326D722b6b02e0c";
									const amount = ethers.utils.parseUnits("15", 18);

									if (!account || !account.address) {
										throw new Error(
											"La cuenta no está definida o no tiene una dirección válida"
										);
									}

									const signer = useWeb3Store.getState().signer;
									const abi = [
										"function mint(address token, address recipient, uint256 amount)",
									];
									const contract = new ethers.Contract(minter, abi, signer);

									const tx = await contract.mint(
										tokenToMintContract,
										account.address,
										amount
									);
									await tx.wait();
									console.log("Transaction submitted", tx.hash);
									return tx;
								}}
								onTransactionSent={(result) => {
									console.log("Transaction submitted", result.transactionHash);
								}}
								onTransactionConfirmed={(receipt) => {
									console.log("Transaction confirmed", receipt.transactionHash);
								}}
								onError={(error) => {
									console.error("Transaction error", error);
								}}
								gasless={{
									provider: "openzeppelin",
									relayerUrl: `https://api.defender.openzeppelin.com/actions/d13d2ed9-8caa-4215-a16d-068b1e6e67c9/runs/webhook/76e39a09-c42a-4cb5-972c-3615fab4ed2c/SuXNRXuivBSikM1xxeDw5x`, // URL del webhook de Defender
									relayerForwarderAddress:
										"0xD7317CCa92D40Dd38216e39bB2f968b6Cd9F349f",
								}}
							>
								Confirm Transaction
							</TransactionButton> */}

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
			{account && claiming && (
				<>
					<div className="flex items-center justify-center ">
						<button className="w-fit text-black">We moved to base!</button>
					</div>
					<div className="flex items-center justify-center ">
						<button
							className="w-fit text-white bg-black m-1rem"
							onClick={performBurnAndMint}
						>
							CLAIM YOUR TOKENS NOW!
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default Header;
