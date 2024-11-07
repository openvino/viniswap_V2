import { ethers } from "ethers";
import React, { useState } from "react";
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
import { tokens } from "../utils/bridgeTokens";
import { erc20ABI, forwarderABI, mtbABI, vaultABI } from "../utils/abi";
import { toWei } from "../utils/ether-utils";
import useWeb3Store from "../zustand/store";
import { optimismSepolia } from "thirdweb/chains";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { chain, client } from "../config/thirdwebClient";

import { TransactionButton } from "thirdweb/react";
import { signMetaTxRequest } from "../utils/signer";
const Migrate = () => {
	const account = useActiveAccount();

	const switchChain = useSwitchActiveWalletChain();
	const [tokenAddress, setTokenAddress] = useState("");
	const [cutoffDate, seTcutoffDate] = useState(
		new Date("2024-10-20T18:23:00Z").getTime()
	);

	const legacyProvider = new ethers.providers.JsonRpcProvider(
		process.env.NEXT_PUBLIC_LEGACY_PROVIDER
	);

	const formatDate = (timestamp) => {
		return new Date(timestamp)
			.toISOString()
			.replace("T", " ")
			.replace("Z", " UTC");
	};

	const processUserTokensData = async () => {
		if (!account) {
			console.log("No hay una cuenta conectada.");
			return [];
		}

		const formattedCutoffDate = formatDate(cutoffDate);
		console.log("Cutoff Date:", formattedCutoffDate);

		let tokenDataList = [];

		for (let tokenAddress of tokens) {
			const tokenContract = new ethers.Contract(
				tokenAddress,
				erc20ABI,
				legacyProvider
			);

			const balance = await tokenContract.balanceOf(account.address);
			const filter = tokenContract.filters.Transfer(null, account.address);
			const events = await tokenContract.queryFilter(filter);

			let transactions = [];
			let mintingStatus = "enabled";

			for (let event of events) {
				const block = await legacyProvider.getBlock(event.blockNumber);
				const timestamp = block.timestamp * 1000;

				const direction =
					event.args.from === account.address ? "Enviado" : "Recibido";

				transactions.push({
					date: formatDate(timestamp),
					rawDate: timestamp,
					blockNumber: event.blockNumber,
					transactionHash: event.transactionHash,
					direction: direction,
				});

				if (timestamp > cutoffDate) {
					mintingStatus = "banned";
				}
			}

			transactions.sort((a, b) => b.rawDate - a.rawDate);

			tokenDataList.push({
				tokenAddress: tokenAddress,
				balance: ethers.utils.formatUnits(balance, 18),
				minting: mintingStatus,
				cutoffDate: formattedCutoffDate,
				transactions: transactions,
			});
		}

		console.log("Información de los tokens:", tokenDataList);
		return tokenDataList;
	};

	const handleMigrate = async () => {
		const signer = account.signer;
		const tokenData = await processUserTokensData();
		console.log("Tokens Data:", tokenData);
		const availableTokens = tokenData.filter((token) => token.balance > 0);
		if (availableTokens.length === 0) {
			console.log("No hay tokens disponibles.");
			return;
		}
		switchChain(optimismSepolia);
		try {
			console.log("Available Tokens:", availableTokens);
			console.log(process.env.NEXT_PUBLIC_VAULT);

			const vaultContract = new ethers.Contract(
				process.env.NEXT_PUBLIC_VAULT,
				vaultABI,
				legacyProvider
			);

			for (let token of availableTokens) {
				const provider = ethers5Adapter.provider.toEthers({
					client,
					chain: optimismSepolia,
				});
				const signer = await ethers5Adapter.signer.toEthers({
					client: client,
					chain: optimismSepolia,
					account: account,
				});
				const tokenContract = new ethers.Contract(
					availableTokens[0].tokenAddress, //token.tokenAddress,
					mtbABI,
					signer
				);
				const forwarder = new ethers.Contract(
					process.env.NEXT_PUBLIC_FORWARDER, //token.tokenAddress,
					forwarderABI,
					signer
				);
				console.log("<><><><><><><><><><><><><><><><", forwarder);
				console.log(
					"vault",
					process.env.NEXT_PUBLIC_VAULT,
					"<><><<>><><><><><><>>><>><><><><><><"
				);

				const grantAllowance = await tokenContract.approve(
					process.env.NEXT_PUBLIC_VAULT,
					// toWei(balance.toString()).toString()
					toWei("1").toString()
				);
				// const allowance = await grantAllowance.wait();
				console.log(">>>>>>>>>>>>>>>>", grantAllowance);

				const token = availableTokens[0].tokenAddress;
				const amount = toWei("1").toString();
				const data = vaultContract.interface.encodeFunctionData("deposit", [
					token,
					amount,
				]);

				const request = await signMetaTxRequest(signer, forwarder, {
					token,
					amount,
					data,
					gasLimit: 80000,
				});
				const url =
					"https://api.defender.openzeppelin.com/actions/d13d2ed9-8caa-4215-a16d-068b1e6e67c9/runs/webhook/76e39a09-c42a-4cb5-972c-3615fab4ed2c/4aEHdc5LpruDCtN7Y9qYk2";

				console.log(">>>>>>>>>>>>>>>>>>>>>>", request);
				const response = await fetch(url, {
					method: "POST",
					body: JSON.stringify(request),
					headers: { "Content-Type": "application/json" },
				});

				const responseData = await response.json();
				// const response = await fetch("http://localhost:3000/api/ozRequest", {
				// 	method: "POST",
				// 	body: { request },
				// });
				// const response = await fetch(
				// 	"https://f279-2800-40-41-6f41-f1b2-8681-fdaa-b836.ngrok-free.app/api/ozRequest",
				// 	{
				// 		method: "POST",
				// 		body: JSON.stringify(request),
				// 		headers: {
				// 			// Authorization: `Bearer ${process.env.NEXT_PUBLIC_RELAYER_API_KEY}`,
				// 			"Content-Type": "application/json",
				// 		},
				// 	}
				// );
				console.log(responseData);

				if (!response.ok) {
					console.error("Error al enviar la transacción:", responseData);
					throw new Error(
						`Error del relayer: ${responseData.message || "Unknown error"}`
					);
				}

				// const tx = await vaultContract.connect(signer).deposit(
				// 	availableTokens[0].tokenAddress, //token.tokenAddress,
				// 	// toWei(balance.toString())
				// 	toWei("1")
				// );
				// const depositData = vaultContract.interface.encodeFunctionData(
				// 	"deposit",
				// 	[availableTokens[0].tokenAddress, toWei("1")]
				// );
				// const tx = await relayer.sendTransaction({
				// 	to: process.env.NEXT_PUBLIC_VAULT,
				// 	data: depositData,
				// 	from: account.address,
				// 	gasLimit: 80000,
				// });

				// console.log("Transacción enviada:", tx);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="flex items-center justify-center align-middle flex-col h-screen w-screen">
			<button
				className="h-[3rem] w-fit rounded-t-xl p-1 bg-purple-500 "
				onClick={handleMigrate}
			>
				Migrate to base
			</button>
			;
		</div>
	);
};

export default Migrate;
