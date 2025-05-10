import { BigNumber, ethers } from "ethers";
import {
	routerContract,
	mtb24Contract,
	wethContract,
	pairContract,
} from "./contract";
import { toEth, toWei } from "./ether-utils";
import { getCoinName } from "./SupportedCoins";
import { bridgeAbi, mtb24ABI, pairABI, routerABI, wethABI } from "./abi";
import { getPairAddress } from "./whitelistedPools";
const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS;

const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER;

import useWeb3Store from "../zustand/store";
import { thirdwebWethContract } from "../config/thirdwebClient";
// import { deposit } from "thirdweb/extensions/erc20";

// SIN USAR sendBatch
// export const swapWethToTokensBatch = async (tokenAmount) => {
// 	const wethContract = thirdwebWethContract;

// 	const smartAccount = useWeb3Store.getState().activeAccount;
// 	if (!smartAccount) return;

// 	const pairAddress = getPairAddress([TOKEN_ADDRESS, WETH_ADDRESS]);
// 	console.log(pairAddress, "pairAddress");

// 	const exactTokenAmount = Math.floor(tokenAmount);
// 	console.log(exactTokenAmount);

// 	const routerObj = await routerContract();
// 	if (!routerObj) {
// 	  throw new Error("No se pudo obtener el contrato del router");
// 	}
// 	console.log(routerObj);

// 	const pairContractObj = await pairContract(pairAddress);
// 	const reserves = await pairContractObj.getReserves();
// 	console.log(reserves, "reserves");

// 	const reserveOut = reserves[1];
// 	const reserveIn = reserves[0];
// 	console.log(toWei(toEth(reserveOut)), toWei(toEth(reserveIn)));

// 	const signer = useWeb3Store.getState().signer;
// 	const initialTokenBalance = await tokenBalance();
// 	const initialWethBalance = await wethBalance();
// 	console.log(initialTokenBalance, initialWethBalance);

// 	const amount = ethers.BigNumber.from(toWei(tokenAmount));
// 	console.log(amount.toString(), reserveIn.toString(), reserveOut.toString());

// 	const amountIn = await routerObj.getAmountIn(amount, reserveIn, reserveOut); // Price
// 	console.log(toEth(amountIn), "amountIn");
// 	const amountSlippage = amountIn.mul(120).div(100);
// 	const finalAmountBN = ethers.utils.parseUnits(amountSlippage.toString(), "wei");

// 	const finalAmount = finalAmountBN.toString();
// 	console.log(finalAmountBN.toString(), "finalAmountInWei");

// 	// Paso 1: Depositar ETH (wrapping a WETH)
// 	updateTransactionMessage("STEP 1/3 - Depositing ETH...");
// 	const deposit = async () => {
// 		await wrapEth(toEth(finalAmount));
// 	//   try {

// 	// 	// console.log("Deposit transaction completed: ", receipt);
// 	// 	// return receipt;
// 	//   } catch (error) {
// 	// 	console.error("Error in deposit:", error);
// 	// 	throw error;
// 	//   }
// 	};

// 	// Paso 2: Otorgar permisos al router para gastar WETH
// 	const grantAllowance = async () => {
// 	  try {
// 		const tx = await increaseWethAllowance(toEth(finalAmountBN.toString()));
// 		const receipt = await tx.wait();
// 		console.log("Allowance granted: ", receipt);
// 		return receipt;
// 	  } catch (error) {
// 		console.error("Error in grant allowance:", error);
// 		throw error;
// 	  }
// 	};

// 	// Paso 3: Swap de WETH a Tokens
// 	const swap = async () => {
// 		updateTransactionMessage("Swapping WETH to tokens...");
// 	  try {
// 		const gasLimit = ethers.utils.hexlify(500000);
// 		const tx = await routerObj.connect(signer).swapTokensForExactTokens(
// 		  toWei(tokenAmount),
// 		  toWei(initialWethBalance),
// 		  [WETH_ADDRESS, TOKEN_ADDRESS],
// 		  smartAccount.address,
// 		  Math.floor(Date.now() / 1000) + 60 * 10,
// 		  { gasLimit }
// 		);
// 		const receipt = await tx.wait();
// 		console.log("Swap transaction completed: ", receipt);
// 		return receipt;
// 	  } catch (error) {
// 		console.error("Error in swap:", error);
// 		throw error;
// 	  }
// 	};

// 	try {
// 		updateTransactionMessage("STEP 1/3 - Depositing ETH...");

// 	  await deposit();

// 		updateTransactionMessage("STEP 2/3 - Granting ETH alowance...");

// 	  await grantAllowance();
// 	  updateTransactionMessage("STEP 3/3 - Performing swap...");
// 	  const receipt = await swap();
// 	  updateTransactionMessage("Transaction completed successfully.");
// 	  console.log("Batch transaction completed successfully.", receipt);
// 	  return receipt;
// 	} catch (error) {
// 	  console.error("Batch transaction failed:", error);
// 	  throw new Error("Batch transaction failed");
// 	}
//   };

// USANDO sendBatch
export const swapWethToTokensBatch = async (tokenAmount, sendBatch) => {
	const wethContract = thirdwebWethContract;
	updateTransactionMessage("Swapping WETH to tokens...");
	const smartAccount = useWeb3Store.getState().activeAccount;
	if (!smartAccount) return;

	const pairAddress = getPairAddress([TOKEN_ADDRESS, WETH_ADDRESS]);
	console.log(pairAddress, "pairAddress");

	const exactTokenAmount = Math.floor(tokenAmount);
	console.log(exactTokenAmount);

	const routerObj = await routerContract();
	if (!routerObj) {
		throw new Error("No se pudo obtener el contrato del router");
	}
	console.log(routerObj);

	const pairContractObj = await pairContract(pairAddress);
	const reserves = await pairContractObj.getReserves();
	const reserveOut = reserves[1];
	const reserveIn = reserves[0];
	console.log(toWei(toEth(reserveOut)), toWei(toEth(reserveIn)));

	const signer = useWeb3Store.getState().signer;
	const initialTokenBalance = await tokenBalance();
	const initialWethBalance = await wethBalance();
	console.log(initialTokenBalance, initialWethBalance);

	const amount = ethers.BigNumber.from(toWei(tokenAmount));
	console.log(amount.toString(), reserveIn.toString(), reserveOut.toString());

	const amountIn = await routerObj.getAmountIn(amount, reserveIn, reserveOut); // Price
	console.log(toEth(amountIn), "amountIn");
	const amountSlippage = amountIn.mul(120).div(100);
	const finalAmountBN = ethers.utils.parseUnits(
		amountSlippage.toString(),
		"wei"
	);

	const finalAmount = finalAmountBN.toString();

	console.log(finalAmountBN.toString(), "finalAmountInWei");
	updateTransactionMessage("STEP 1/3 - Depositing ETH...");
	const deposit = async (amount) => {
		const depositReceipt = await wrapEth(toEth(amount));
	};

	const swap = async () => {
		try {
			const gasLimit = ethers.utils.hexlify(500000);
			const tx = await routerObj
				.connect(signer)
				.swapTokensForExactTokens(
					toWei(tokenAmount),
					toWei(initialWethBalance),
					[WETH_ADDRESS, TOKEN_ADDRESS],
					smartAccount.address,
					Math.floor(Date.now() / 1000) + 60 * 10,
					{ gasLimit }
				);

			const receipt = await tx.wait();
			console.log(receipt);

			const afterSwapTokenBalance = await tokenBalance();
			const afterSwapWethBalance = await wethBalance();

			console.log(afterSwapTokenBalance, afterSwapWethBalance);

			return receipt;
		} catch (error) {
			console.log(error);
		}
	};
	const grantAllowance = async (amount) => {
		const tx = await increaseWethAllowance(toEth(finalAmountBN.toString()));
	};
	// console.log("Deposit receipt: ", depositReceipt);
	// const depositReceipt = await wrapEth(toEth(finalAmount));

	const transactions = [
		deposit(finalAmount),
		grantAllowance(finalAmount),
		swap(),
	];

	sendBatch(transactions, {
		// onError: (error) => {
		// 	console.log(`Error: ${error.message}`);
		// },
		// onSuccess: (result) => {
		// 	// refetchNFTs();
		// 	// refetchTokens();
		// 	console.log("Success! Tx hash: " + result?.transactionHash);
		// 	console.log(transactionResult);
		// },
	});

	// ]	await sendBatchTransaction(transactions);
	// updateTransactionMessage("STEP 2/3 - Granting ETH alowance...");
	// await increaseWethAllowance(toEth(finalAmountBN.toString()));
	// updateTransactionMessage("STEP 3/3 - Performing swap...");
};
// swapWethToTokensBatch(1)

export const updateTransactionMessage = (newMessage) => {
	const setTransactionMessage = useWeb3Store.getState().setTransactionMessage;
	setTransactionMessage(newMessage);
};

export const tokenBalance = async (tokenAddress) => {
	try {
		const tokenContractObj = await mtb24Contract(tokenAddress);
		const routerObj = await routerContract();
		const activeAccount = useWeb3Store.getState().activeAccount;
		const walletAddress = activeAccount.address;
		console.log(walletAddress);

		const name = await tokenContractObj.name();
		const balance = await tokenContractObj.balanceOf(walletAddress);
		const formatedBalance = toEth(balance).toString();
		console.log(name);
		console.log(formatedBalance);
		return formatedBalance;
	} catch (error) {
		console.log(error);
	}
};

export const wethBalance = async () => {
	try {
		const routerObj = await routerContract();
		const activeAccount = useWeb3Store.getState().activeAccount;
		const walletAddress = activeAccount.address;
		const wethContractObj = await wethContract(WETH_ADDRESS);
		const name = await wethContractObj.name();

		const balance = await wethContractObj.provider.getBalance(walletAddress);
		const formatedBalance = toEth(balance).toString();

		console.log(formatedBalance);
		return formatedBalance;
	} catch (error) {
		console.log(error);
	}
};

export const tokenAllowance = async (tokenAddress) => {
	try {
		const routerObj = await routerContract();
		const activeAccount = useWeb3Store.getState().activeAccount;
		const walletAddress = activeAccount.address;
		const tokenContractObj = await mtb24Contract(tokenAddress);
		const name = await tokenContractObj.name();
		const allowance = await tokenContractObj.allowance(
			walletAddress,
			routerObj.address
		);
		const formattedAllowance = toEth(allowance).toString();
		console.log("Nombre del token:", name);
		console.log("Allowance:", formattedAllowance);

		return formattedAllowance;
	} catch (error) {
		console.log(error);
	}
};

export const wethAllowance = async () => {
	try {
		const routerObj = await routerContract();
		const activeAccount = useWeb3Store.getState().activeAccount;
		const walletAddress = activeAccount.address;
		const wethContractObj = await wethContract(WETH_ADDRESS);
		const name = await wethContractObj.name();
		const allowance = await wethContractObj.allowance(
			walletAddress,
			routerObj.address
		);
		const formattedAllowance = toEth(allowance).toString();
		console.log("Nombre del token:", name);
		console.log("Alloance:", formattedAllowance);

		return formattedAllowance;
	} catch (error) {
		console.log(error);
	}
};

// export const increaseBridgeAllowance = async (
// 	amount,
// 	tokenAddress,
// 	bridgeAddress
// ) => {
// 	try {
// 		const signer = new ethers.providers.Web3Provider(
// 			window.ethereum
// 		).getSigner();

// 		const tokenContractObj = new ethers.Contract(
// 			tokenAddress,
// 			mtb24ABI,
// 			signer
// 		);

// 		const bridgeContractObj = new ethers.Contract(
// 			bridgeAddress,
// 			bridgeAbi,
// 			signer
// 		);

// 		const approvalTx = await tokenContractObj.approve(
// 			bridgeContractObj.address,
// 			toWei(amount.toString()).toString()
// 		);

// 		const receipt = await approvalTx.wait();
// 		console.log("Approval transaction receipt:", receipt);

// 		return receipt;
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

export const increaseTokenAllowance = async (amount, tokenAddress) => {
	console.log(amount, tokenAddress);

	try {
		const routerObj = await routerContract();
		const tokenContractObj = await mtb24Contract(tokenAddress);

		const name = await tokenContractObj.name();
		const totalAmount = await tokenBalance(tokenAddress);
		console.log(totalAmount);

		const approvalTx = await tokenContractObj.approve(
			routerObj.address,
			toWei(amount.toString()).toString()
		);

		const receipt = await approvalTx.wait();
		console.log("Approval transaction receipt:", receipt);

		return receipt;
	} catch (error) {
		console.log(error);
	}
};

export const increaseWethAllowance = async (amount) => {
	console.log(amount);
	try {
		const routerObj = await routerContract();
		console.log(routerObj);

		const wethContractObj = await wethContract(WETH_ADDRESS);
		console.log(wethContractObj);

		const name = await wethContractObj.name();
		const totalAmount = await wethBalance();
		console.log(totalAmount);
		const approvalTx = await wethContractObj.approve(
			routerObj.address,
			toWei(amount.toString()).toString()
		);

		// const receipt = await approvalTx.wait();
		console.log("Approval transaction receipt:", approvalTx);

		return approvalTx;
	} catch (error) {
		console.log(error);
	}
};

export const getTokenPrice = async (amount = 1, tokenAddress) => {
	try {
		const routerObj = await routerContract();
		const amountOut = toWei(amount?.toString() || "1");

		const path = [tokenAddress, WETH_ADDRESS];

		let amounts = await routerObj?.getAmountsOut(amountOut, path);

		if (!amounts) {
			amounts = [0, 0];
		}

		const priceInWeth = ethers.utils.formatEther(amounts[1]);
		console.log("Precio del token en WETH:", priceInWeth);

		return priceInWeth;
	} catch (error) {
		console.error("Error al obtener el precio del token:", error);
		throw error;
	}
};
export const getPrice = async (address0, address1) => {
	const pairAddress = getPairAddress([address0, address1]);

	try {
		const pairContractObj = await pairContract(pairAddress);
		const token0 = await pairContractObj.token0();
		const token1 = await pairContractObj.token1();
		const path = [token0, token1];
		const poolReserves = await pairContractObj.getReserves();

		const token0Reserves = toEth(poolReserves[0]);
		const token1Reserves = toEth(poolReserves[1]);
		const priceToken0InToken1 = poolReserves[0] / poolReserves[1]; //amount tokens of token0 needed to get 1 token of token1
		const priceToken1InToken0 = poolReserves[1] / poolReserves[0]; //amount tokens of token1 needed to get 1 token of token0

		console.log(token0Reserves, token1Reserves);
		console.log(priceToken1InToken0, priceToken0InToken1);

		const priceObj = {
			priceToken0InToken1,
			priceToken1InToken0,
			path,
			token0Reserves,
			token1Reserves,
		};
		return priceObj || {};
	} catch (error) {
		console.error("Error fetching price:", error);
	}
};

export const swapTokensToWeth = async (tokenAmount, tokenAddress) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		updateTransactionMessage("STEP 1/3 Granting token allowance...");
		const allowanceReceipt = await increaseTokenAllowance(
			tokenAmount,
			tokenAddress
		);
		console.log(allowanceReceipt);

		if (!allowanceReceipt) {
			throw new Error("Allowance cannot be granted");
		}
		const allowanceStatus = await tokenAllowance();
		console.log("Allowance status: ", allowanceStatus);
		const routerObj = await routerContract();
		console.log("router address:", routerObj.address);

		const signer = useWeb3Store.getState().signer;
		const initialTokenBalance = await tokenBalance();
		const initialWethBalance = await wethBalance();
		console.log(initialTokenBalance, initialWethBalance);
		updateTransactionMessage("STEP 2/3 performing swap...");
		const tx = await routerObj.connect(signer).swapExactTokensForTokens(
			toWei(tokenAmount.toString()), // Cantidad exacta de tokens de entrada

			0,
			[
				//  (from TOKEN_ADDRESS to WETH_ADDRESS)
				tokenAddress,
				WETH_ADDRESS,
			],
			activeAccount.address,
			Math.floor(Date.now() / 1000) + 60 * 10
		);
		const result = await tx.wait();
		console.log(result);
		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();
		console.log(afterSwapTokenBalance, afterSwapWethBalance);
		updateTransactionMessage("STEP 3/3 withdrawing Eth...");
		const withdrawReceipt = await unwrapEth();
		if (!withdrawReceipt) {
			throw new Error(
				"Swap performed, but weth withdrawal failed. Please withdraw manually"
			);
		}

		console.log("weth withdrawn succesfully", withdrawReceipt);
		return result;
	} catch (error) {
		console.log(error);
	}
};

export const swapWethToTokens = async (tokenAmount, tokenAddress) => {
	updateTransactionMessage("Swapping WETH to tokens...");
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		const pairAddress = getPairAddress([tokenAddress, WETH_ADDRESS]);
		const pairObj = await pairContract(pairAddress);

		const tokenAddress0 = await pairObj.token0();
		const tokenAddress1 = await pairObj.token1();
		console.log(pairAddress, "pairAddress");
		console.log("resservesFromPair", tokenAddress0, tokenAddress1);

		const exactTokenAmount = Math.floor(tokenAmount);
		console.log(exactTokenAmount);

		const routerObj = await routerContract();
		if (!routerObj) {
			throw new Error("No se pudo obtener el contrato del router");
		}
		console.log(routerObj);

		const pairContractObj = await pairContract(pairAddress);
		const reserves = await pairContractObj.getReserves();

		console.log(reserves, "reserves");
		console.log(tokenAddress0 === WETH_ADDRESS, tokenAddress1 === WETH_ADDRESS);

		const reserveOut =
			tokenAddress0 === WETH_ADDRESS ? reserves[1] : reserves[0];
		const reserveIn =
			tokenAddress0 === WETH_ADDRESS ? reserves[0] : reserves[1];
		console.log(toWei(toEth(reserveOut)), toWei(toEth(reserveIn)));

		const signer = useWeb3Store.getState().signer;
		const initialTokenBalance = await tokenBalance(tokenAddress);
		console.log(initialTokenBalance);

		const initialWethBalance = await wethBalance();
		console.log(initialTokenBalance, initialWethBalance);

		const amount = ethers.BigNumber.from(toWei(tokenAmount));
		console.log(amount.toString(), reserveIn.toString(), reserveOut.toString());
		console.log(routerObj, "routerObj");

		const amountIn = await routerObj.getAmountIn(
			amount.toString(),
			reserveIn,
			reserveOut
		); // Price
		// const numerator = reserveIn.mul(tokenAmount).mul(BigNumber.from(1000));
		// const denominator = reserveOut.sub(tokenAmount).mul(BigNumber.from(995));
		// console.log(numerator.toString(), denominator.toString());

		// const amountIn = numerator.div(denominator).add(ethers.constants.One);
		console.log(toEth(amountIn), "amountIn");
		const amountSlippage = amountIn.mul(120).div(100);
		const finalAmountBN = ethers.utils.parseUnits(
			amountSlippage.toString(),
			"wei"
		);

		const finalAmount = finalAmountBN.toString();

		console.log(finalAmountBN.toString(), "finalAmountInWei");
		updateTransactionMessage("STEP 1/3 - Depositing ETH...");
		const depositReceipt = await wrapEth(toEth(finalAmount));
		console.log("Deposit receipt: ", depositReceipt);
		updateTransactionMessage("STEP 2/3 - Granting ETH alowance...");
		await increaseWethAllowance(toEth(finalAmountBN.toString()));
		updateTransactionMessage("STEP 3/3 - Performing swap...");
		const gasLimit = ethers.utils.hexlify(500000);
		const tx = await routerObj
			.connect(signer)
			.swapTokensForExactTokens(
				toWei(tokenAmount),
				toWei(initialWethBalance),
				[WETH_ADDRESS, tokenAddress],
				activeAccount.address,
				Math.floor(Date.now() / 1000) + 60 * 10,
				{ gasLimit }
			);

		const receipt = await tx.wait();
		console.log(receipt);

		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();

		console.log(afterSwapTokenBalance, afterSwapWethBalance);
		updateTransactionMessage("withdrawing Eth...");
		await unwrapEth();
		return receipt;
	} catch (error) {
		console.log(error);
	}
};
// swapWethToTokens(200);

export const lpTokenBalance = async (pairAddress) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		const pairContractObj = await pairContract(pairAddress);
		const routerObj = await routerContract();
		const walletAddress = activeAccount.address;

		const balance = await pairContractObj.balanceOf(walletAddress);
		const formatedBalance = toEth(balance).toString();

		console.log(formatedBalance);
		return formatedBalance;
	} catch (error) {
		console.log(error);
	}
};

export const addLiquidity = async (
	tokenAAddress,
	tokenBAddress,
	amountAdesired,
	amountBdesired,
	amountAMin,
	amountBMin
) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	console.log(activeAccount.address);

	const allowanceAStatus = await allowanceStatus(tokenAAddress);
	const allowanceBStatus = await allowanceStatus(tokenBAddress);
	console.log(allowanceAStatus, allowanceBStatus);

	const routerObj = await routerContract();
	const signer = useWeb3Store.getState().signer;
	console.log(routerObj, signer);

	if (!routerObj) {
		console.error("No se pudo obtener el contrato del router");
		return;
	}
	console.log(
		tokenAAddress,
		tokenBAddress,
		toWei(amountAdesired.toString()),
		toWei(amountBdesired.toString()),
		"0",
		"0",
		activeAccount.address,
		Math.floor(Date.now() / 1000) + 60 * 10
	);

	try {
		const gasLimit = ethers.utils.hexlify(300000);
		const tx = await routerObj
			.connect(signer)
			.addLiquidity(
				tokenAAddress,
				tokenBAddress,
				toWei(amountAdesired.toString()),
				toWei(amountBdesired.toString()),
				"0",
				"0",
				activeAccount.address,
				Math.floor(Date.now() / 1000) + 60 * 10,
				{ gasLimit }
			);

		const receipt = await tx.wait();
		console.log(receipt);
		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();
		console.log(afterSwapTokenBalance, afterSwapWethBalance);
		return receipt;
	} catch (error) {
		console.log(error);
	}
};

export const allowanceStatus = async (tokenAddress) => {
	let allowance = 0;
	const name = getCoinName(tokenAddress);
	if (name === "ETH") allowance = await wethAllowance();
	else allowance = await tokenAllowance();
	console.log(allowance);
	return allowance;
};

export const removeLiquidity = async (
	tokenAAddress,
	tokenBAddress,
	lpAmount
) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	const routerObj = await routerContract();

	const signer = useWeb3Store.getState().signer;
	if (!routerObj) {
		console.error("No se pudo obtener el contrato del router");
		return;
	}

	const formattedAmount = toWei(lpAmount);
	console.log(formattedAmount);
	try {
		const tx = await routerObj
			.connect(signer)
			.removeLiquidity(
				tokenAAddress,
				tokenBAddress,
				formattedAmount,
				"0",
				"0",
				activeAccount.address,
				Math.floor(Date.now() / 1000) + 60 * 10
			);

		const receipt = await tx.wait();
		console.log(receipt);

		return receipt;
	} catch (error) {
		console.log(error);
	}
};

export const lpTokenAllowance = async ({ liquidityAmount, address }) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	console.log(liquidityAmount, address);
	try {
		const pairContractObj = await pairContract(address);

		const routerObj = await routerContract();
		const routerAddress = routerObj.address;
		console.log(routerAddress);

		const formattedAmount = toWei(liquidityAmount);
		console.log(formattedAmount);
		const receipt = await pairContractObj.approve(
			routerAddress,
			formattedAmount
		);
		console.log(receipt);
		return receipt;
	} catch (error) {
		console.log(error);
	}
};

export const wrapEth = async (amount) => {
	const signer = useWeb3Store.getState().signer;
	if (!amount > 0) return;
	try {
		const routerObj = await routerContract();

		const wethContractObj = new ethers.Contract(WETH_ADDRESS, wethABI, signer);

		const tx = await wethContractObj.deposit({
			value: toWei(amount.toString()),
		});

		const receipt = await tx.wait();
		return receipt;
		// console.log("Wrap ETH transaction receipt:", receipt? receipt:"No receipt");
		// return receipt? receipt:"No receipt";
	} catch (error) {
		console.error("Error wrapping ETH:", error);
		throw error;
	}
};

export const unwrapEth = async () => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		const signer = useWeb3Store.getState().signer;
		const wethContractObj = new ethers.Contract(WETH_ADDRESS, wethABI, signer);
		const balance = await wethContractObj.balanceOf(activeAccount.address);
		console.log(toEth(balance));
		const tx = await wethContractObj.withdraw(balance);
		const receipt = await tx.wait();
		console.log("Unwrap ETH transaction receipt:", receipt);
		return receipt;
	} catch (error) {
		console.error("Error unwrapping ETH:", error);
		throw error;
	}
};

export const increaseAllowance = async (amount, token) => {
	try {
		if (token.name === "ETH") {
			const receipt = await increaseWethAllowance(amount * 1.1);
			console.log(receipt);
			return receipt;
		} else {
			const receipt = await increaseTokenAllowance(amount, token.address);
			console.log(receipt);
			return receipt;
		}
	} catch (error) {
		console.log(error);
	}
};
