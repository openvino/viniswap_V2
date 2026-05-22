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
//
// 	const exactTokenAmount = Math.floor(tokenAmount);
//
// 	const routerObj = await routerContract();
// 	if (!routerObj) {
// 	  throw new Error("No se pudo obtener el contrato del router");
// 	}
//
// 	const pairContractObj = await pairContract(pairAddress);
// 	const reserves = await pairContractObj.getReserves();
//
// 	const reserveOut = reserves[1];
// 	const reserveIn = reserves[0];
//
// 	const signer = useWeb3Store.getState().signer;
// 	const initialTokenBalance = await tokenBalance();
// 	const initialWethBalance = await wethBalance();
//
// 	const amount = ethers.BigNumber.from(toWei(tokenAmount));
//
// 	const amountIn = await routerObj.getAmountIn(amount, reserveIn, reserveOut); // Price
//// 	const amountSlippage = amountIn.mul(120).div(100);
// 	const finalAmountBN = ethers.utils.parseUnits(amountSlippage.toString(), "wei");

// 	const finalAmount = finalAmountBN.toString();
//
// 	// Paso 1: Depositar ETH (wrapping a WETH)
// 	updateTransactionMessage("STEP 1/3 - Depositing ETH...");
// 	const deposit = async () => {
// 		await wrapEth(toEth(finalAmount));
// 	//   try {

// 	// 	//// 	// 	// return receipt;
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
//// 		return receipt;
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
//// 		return receipt;
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
//// 	  return receipt;
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
	const exactTokenAmount = Math.floor(tokenAmount);
	const routerObj = await routerContract();
	if (!routerObj) {
		throw new Error("No se pudo obtener el contrato del router");
	}
	const pairContractObj = await pairContract(pairAddress);
	const reserves = await pairContractObj.getReserves();
	const reserveOut = reserves[1];
	const reserveIn = reserves[0];
	const signer = useWeb3Store.getState().signer;
	const initialTokenBalance = await tokenBalance();
	const initialWethBalance = await wethBalance();
	const amount = ethers.BigNumber.from(toWei(tokenAmount));
	const amountIn = await routerObj.getAmountIn(amount, reserveIn, reserveOut); // Price	const amountSlippage = amountIn.mul(120).div(100);
	const finalAmountBN = ethers.utils.parseUnits(
		amountSlippage.toString(),
		"wei"
	);

	const finalAmount = finalAmountBN.toString();	updateTransactionMessage("STEP 1/3 - Depositing ETH...");
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
			const afterSwapTokenBalance = await tokenBalance();
			const afterSwapWethBalance = await wethBalance();
			return receipt;
		} catch (error) {		}
	};
	const grantAllowance = async (amount) => {
		const tx = await increaseWethAllowance(toEth(finalAmountBN.toString()));
	};
	//	// const depositReceipt = await wrapEth(toEth(finalAmount));

	const transactions = [
		deposit(finalAmount),
		grantAllowance(finalAmount),
		swap(),
	];

	sendBatch(transactions, {
		// onError: (error) => {
		//		// },
		// onSuccess: (result) => {
		// 	// refetchNFTs();
		// 	// refetchTokens();
		//		//		// },
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
		const name = await tokenContractObj.name();
		const balance = await tokenContractObj.balanceOf(walletAddress);
		const formatedBalance = toEth(balance).toString();		return formatedBalance;
	} catch (error) {	}
};

export const wethBalance = async () => {
	try {
		const routerObj = await routerContract();
		const activeAccount = useWeb3Store.getState().activeAccount;
		const walletAddress = activeAccount.address;
		const wethContractObj = await wethContract(WETH_ADDRESS);
		const name = await wethContractObj.name();

		const balance = await wethContractObj.provider.getBalance(walletAddress);
		const formatedBalance = toEth(balance).toString();		return formatedBalance;
	} catch (error) {	}
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
		return formattedAllowance;
	} catch (error) {	}
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
		return formattedAllowance;
	} catch (error) {	}
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
//
// 		return receipt;
// 	} catch (error) {
//// 	}
// };

export const increaseTokenAllowance = async (amount, tokenAddress) => {
	try {
		const routerObj = await routerContract();
		const tokenContractObj = await mtb24Contract(tokenAddress);

		const name = await tokenContractObj.name();
		const totalAmount = await tokenBalance(tokenAddress);
		const approvalTx = await tokenContractObj.approve(
			routerObj.address,
			toWei(amount.toString()).toString()
		);

		const receipt = await approvalTx.wait();
		return receipt;
	} catch (error) {	}
};

export const increaseWethAllowance = async (amount) => {	try {
		const routerObj = await routerContract();
		const wethContractObj = await wethContract(WETH_ADDRESS);
		const name = await wethContractObj.name();
		const totalAmount = await wethBalance();		const approvalTx = await wethContractObj.approve(
			routerObj.address,
			toWei(amount.toString()).toString()
		);

		// const receipt = await approvalTx.wait();
		return approvalTx;
	} catch (error) {	}
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
		return priceInWeth;
	} catch (error) {
		console.error("Error al obtener el precio del token:", error);
		throw error;
	}
};
export const getPrice = async (address0, address1) => {
	const pairAddress = getPairAddress([address0, address1]);
	if (!pairAddress) return {};

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
		if (!allowanceReceipt) {
			throw new Error("Allowance cannot be granted");
		}
		const allowanceStatus = await tokenAllowance();		const routerObj = await routerContract();
		const signer = useWeb3Store.getState().signer;
		const initialTokenBalance = await tokenBalance();
		const initialWethBalance = await wethBalance();		updateTransactionMessage("STEP 2/3 performing swap...");
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
		const result = await tx.wait();		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();		updateTransactionMessage("STEP 3/3 withdrawing Eth...");
		const withdrawReceipt = await unwrapEth();
		if (!withdrawReceipt) {
			throw new Error(
				"Swap performed, but weth withdrawal failed. Please withdraw manually"
			);
		}		return result;
	} catch (error) {	}
};

export const swapWethToTokens = async (tokenAmount, tokenAddress) => {
	updateTransactionMessage("Swapping WETH to tokens...");
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		const pairAddress = getPairAddress([tokenAddress, WETH_ADDRESS]);
		const pairObj = await pairContract(pairAddress);

		const tokenAddress0 = await pairObj.token0();
		const tokenAddress1 = await pairObj.token1();
		const exactTokenAmount = Math.floor(tokenAmount);
		const routerObj = await routerContract();
		if (!routerObj) {
			throw new Error("No se pudo obtener el contrato del router");
		}
		const pairContractObj = await pairContract(pairAddress);
		const reserves = await pairContractObj.getReserves();
		const reserveOut =
			tokenAddress0 === WETH_ADDRESS ? reserves[1] : reserves[0];
		const reserveIn =
			tokenAddress0 === WETH_ADDRESS ? reserves[0] : reserves[1];
		const signer = useWeb3Store.getState().signer;
		const initialTokenBalance = await tokenBalance(tokenAddress);
		const initialWethBalance = await wethBalance();
		const amount = ethers.BigNumber.from(toWei(tokenAmount));
		const amountIn = await routerObj.getAmountIn(
			amount.toString(),
			reserveIn,
			reserveOut
		); // Price
		// const numerator = reserveIn.mul(tokenAmount).mul(BigNumber.from(1000));
		// const denominator = reserveOut.sub(tokenAmount).mul(BigNumber.from(995));
		//
		// const amountIn = numerator.div(denominator).add(ethers.constants.One);		const amountSlippage = amountIn.mul(120).div(100);
		const finalAmountBN = ethers.utils.parseUnits(
			amountSlippage.toString(),
			"wei"
		);

		const finalAmount = finalAmountBN.toString();		updateTransactionMessage("STEP 1/3 - Depositing ETH...");
		const depositReceipt = await wrapEth(toEth(finalAmount));		updateTransactionMessage("STEP 2/3 - Granting ETH alowance...");
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
		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();		updateTransactionMessage("withdrawing Eth...");
		await unwrapEth();
		return receipt;
	} catch (error) {	}
};
// swapWethToTokens(200);

export const lpTokenBalance = async (pairAddress) => {
	const activeAccount = useWeb3Store.getState().activeAccount;

	try {
		const pairContractObj = await pairContract(pairAddress);
		const routerObj = await routerContract();
		const walletAddress = activeAccount.address;

		const balance = await pairContractObj.balanceOf(walletAddress);
		const formatedBalance = toEth(balance).toString();		return formatedBalance;
	} catch (error) {	}
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
	const allowanceAStatus = await allowanceStatus(tokenAAddress);
	const allowanceBStatus = await allowanceStatus(tokenBAddress);
	const routerObj = await routerContract();
	const signer = useWeb3Store.getState().signer;
	if (!routerObj) {
		console.error("No se pudo obtener el contrato del router");
		return;
	}
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

		const receipt = await tx.wait();		const afterSwapTokenBalance = await tokenBalance();
		const afterSwapWethBalance = await wethBalance();		return receipt;
	} catch (error) {	}
};

export const allowanceStatus = async (tokenAddress) => {
	let allowance = 0;
	const name = getCoinName(tokenAddress);
	if (name === "ETH") allowance = await wethAllowance();
	else allowance = await tokenAllowance();	return allowance;
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

	const formattedAmount = toWei(lpAmount);	try {
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
		return receipt;
	} catch (error) {	}
};

export const lpTokenAllowance = async ({ liquidityAmount, address }) => {
	const activeAccount = useWeb3Store.getState().activeAccount;	try {
		const pairContractObj = await pairContract(address);

		const routerObj = await routerContract();
		const routerAddress = routerObj.address;
		const formattedAmount = toWei(liquidityAmount);		const receipt = await pairContractObj.approve(
			routerAddress,
			formattedAmount
		);		return receipt;
	} catch (error) {	}
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
		//		// return receipt? receipt:"No receipt";
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
		const balance = await wethContractObj.balanceOf(activeAccount.address);		const tx = await wethContractObj.withdraw(balance);
		const receipt = await tx.wait();		return receipt;
	} catch (error) {
		console.error("Error unwrapping ETH:", error);
		throw error;
	}
};

export const increaseAllowance = async (amount, token) => {
	try {
		if (token.name === "ETH") {
			const receipt = await increaseWethAllowance(amount * 1.1);			return receipt;
		} else {
			const receipt = await increaseTokenAllowance(amount, token.address);			return receipt;
		}
	} catch (error) {	}
};
