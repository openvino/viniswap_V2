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

			const smartWallet = wallets.find((wallet) => wallet.id === "smart");
			const isSmartWallet = smartWallet && wallet.id === "smart";
			const walletAddress = await signer.getAddress();

			const transactions = [];

			for (let { tokenAddress, balance } of validTokensList) {
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

				transactions.push(burnTx, mintTx);
			}
			console.log(transactions);

			if (isSmartWallet) {
				await sendBatch(transactions);
				console.log("Batch burn and mint transactions completed successfully");
			} else {
				for (let tx of transactions) {
					const receipt = await provider.sendTransaction(tx);
					await receipt.wait();
					console.log("Transaction completed:", receipt.transactionHash);
				}
			}
		} catch (error) {
			console.error("Error in performBurnAndMint:", error);
		}
	};

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
					mtbABI,
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
		</div>
	);
};

export default Header;
