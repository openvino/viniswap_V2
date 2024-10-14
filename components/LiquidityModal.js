import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import TransactionStatus from "./TransactionStatus";
import { ethers } from "ethers";
import { toEth } from "../utils/ether-utils";

const LiquidityModal = ({
	isOpen,
	onClose,
	onAddLiquidity,
	onRemoveLiquidity,
	srcToken,
	destToken,
	signerBalances,
	reserves,
	isModalOpen,
	setIsModalOpen,
	transactionMessage,
	setTransactionMessage,
	isLoading,
	setIsLoading,
}) => {
	console.log("Reservas ACA:", reserves);

	const [action, setAction] = useState("add");
	const [amounts, setAmounts] = useState({
		tokenAAmount: "",
		tokenBAmount: "",
	});
	const [liquidityAmount, setLiquidityAmount] = useState("");
	const [removePercentage, setRemovePercentage] = useState(0);

	const handleChangeTokenAmount = (e) => {
		console.log(reserves);

		if (!reserves.reserves0 || !reserves.reserves1) return;
		const { name, value } = e.target;
		let price;

		price = ethers.utils
			.parseUnits(reserves.reserves1)
			.div(ethers.utils.parseUnits(reserves.reserves0));
		console.log("PRECIO", price.toString());

		let newAmounts;
		if (name === "tokenAAmount") {
			console.log("hola");
			newAmounts = {
				tokenAAmount: value,
				tokenBAmount: (value / price).toString(),
			};
			console.log(newAmounts);
		} else if (name === "tokenBAmount") {
			newAmounts = {
				tokenAAmount: (value / price).toString(),
				tokenBAmount: value,
			};
			console.log(newAmounts);
		}

		setAmounts(newAmounts);
	};

	const handleSlidePercentage = (e) => {
		const percentage = e.target.value;
		setRemovePercentage(percentage);

		const lpBalanceBN = ethers.utils.parseUnits(
			signerBalances.lpBalance.toString(),
			18
		);

		const newLiquidityAmountBN = lpBalanceBN.mul(percentage).div(100);

		setLiquidityAmount(
			percentage < 100
				? toEth(newLiquidityAmountBN.toString())
				: signerBalances.lpBalance.toString()
		);
	};

	const isExceedingBalance = (tokenAmount, balance) => {
		return parseFloat(tokenAmount) > parseFloat(balance);
	};

	const handleFocus = (e) => {
		if (e.target.value === "") {
			e.target.value = "";
		} else {
			e.target.setSelectionRange(e.target.value.length, e.target.value.length);
		}
	};

	const handleBlur = (e) => {
		if (e.target.value === "") {
			setAmounts((prevAmounts) => ({
				...prevAmounts,
				[e.target.name]: "",
			}));
		}
	};

	const handleAddLiquidity = async () => {
		if (
			isExceedingBalance(amounts.tokenAAmount, signerBalances.srcBalance) ||
			isExceedingBalance(amounts.tokenBAmount, signerBalances.destBalance)
		) {
			return;
		} else {
			setIsLoading(true);
			await onAddLiquidity(
				amounts.tokenAAmount,
				amounts.tokenBAmount,
				setTransactionMessage
			);
			setIsLoading(false);
		}
	};

	const handleRemoveLiquidity = async (removePercentage) => {
		setIsLoading(true);
		await onRemoveLiquidity(
			liquidityAmount,
			signerBalances.lpBalance,
			removePercentage
		);

		setIsLoading(false);
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			className='modal-content bg-[#18181b] p-6 rounded-3xl max-w-md mx-auto'
			overlayClassName='modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center'
			appElement={document.getElementById('#__next"')}
		>
			<div className='text-white'>
				<p className='text-xl mb-4'>Liquidity</p>

				<div className='flex mb-4 justify-center'>
					<button
						className={`mr-2 p-2 rounded-xl w-1/2 h-[3rem] ${
							action === "add"
								? "bg-[#44162e]"
								: "bg-[#212429] hover:bg-[#212429]"
						}`}
						onClick={() => setAction("add")}
						disabled={isLoading}
					>
						Add
					</button>
					<button
						className={`p-2 rounded-xl w-1/2 h-[3rem] ${
							action === "remove"
								? "bg-[#44162e]"
								: "bg-[#212429] hover:bg-[#212429]"
						}`}
						onClick={() => setAction("remove")}
						disabled={isLoading}
					>
						Remove
					</button>
				</div>

				{action === "add" && (
					<div>
						<div className='mb-4'>
							<label>{srcToken.name} amount:</label>
							<input
								name='tokenAAmount'
								type='text'
								value={amounts.tokenAAmount}
								placeholder='0.0'
								className={`w-full p-2 mt-2 rounded-xl h-[3rem] text-3xl py-8 ${
									isExceedingBalance(
										amounts.tokenAAmount,
										signerBalances.srcBalance
									)
										? "text-[#9c5454]"
										: "text-gray-300 bg-[#212429]"
								} focus:outline-none focus:ring-0`}
								onChange={handleChangeTokenAmount}
								onFocus={handleFocus}
								onBlur={handleBlur}
							/>
							<label>{signerBalances.srcBalance}</label>
						</div>
						<div className='mb-4'>
							<label>{destToken.name} amount:</label>
							<input
								name='tokenBAmount'
								type='text'
								value={amounts.tokenBAmount}
								placeholder='0.0'
								className={`w-full p-2 mt-2 rounded-xl h-[3rem] text-3xl py-8 ${
									isExceedingBalance(
										amounts.tokenBAmount,
										signerBalances.destBalance
									)
										? "text-[#9c5454]"
										: "text-gray-300 bg-[#212429]"
								} focus:outline-none focus:ring-0`}
								onChange={handleChangeTokenAmount}
								onFocus={handleFocus}
								onBlur={handleBlur}
							/>
							<label>{signerBalances.destBalance}</label>
						</div>
						<button
							className={
								isLoading
									? "w-full p-2 bg-[#1a0911ad] rounded-xl h-[3rem]  text-[#000000]"
									: "w-full p-2 bg-[#44162e] rounded-xl h-[3rem] hover:bg-[#351223] text-gray-300"
							}
							onClick={handleAddLiquidity}
							disabled={isLoading}
						>
							{isLoading ? "Processing..." : "Add"}
						</button>
					</div>
				)}

				{action === "remove" && (
					<div>
						<div className='mb-4'>
							<label>Liquidity Amount:</label>
							<input
								type='text'
								value={liquidityAmount}
								className='w-full p-2 mt-2 bg-[#212429] rounded-xl h-[3rem] text-3xl py-8 text-gray-300'
								onChange={(e) => setLiquidityAmount(e.target.value)}
							/>
							<label>{signerBalances.lpBalance}</label>
						</div>
						<div className='mb-4 rounded-xl'>
							<div className='flex justify-between flex-row'>
								<label>%</label>
								<label>{removePercentage}%</label>
							</div>

							<input
								type='range'
								min='0'
								max='100'
								value={removePercentage}
								className='w-full mt-2 h-[3rem]'
								onChange={handleSlidePercentage}
							/>
						</div>
						<button
							className={
								isLoading
									? "w-full p-2 bg-[#1a0911ad] rounded-xl h-[3rem]  text-[#000000]"
									: "w-full p-2 bg-[#44162e] rounded-xl h-[3rem] hover:bg-[#351223] text-gray-300"
							}
							onClick={() => handleRemoveLiquidity(removePercentage)}
							disabled={isLoading}
						>
							{isLoading ? "Processing..." : "Remove"}
						</button>
					</div>
				)}
			</div>
			{isLoading && (
				<TransactionStatus
					transactionMessage={transactionMessage}
					setTransactionMessage={setTransactionMessage}
				/>
			)}
		</Modal>
	);
};

export default LiquidityModal;
