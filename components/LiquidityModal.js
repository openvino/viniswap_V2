import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import TransactionStatus from "./TransactionStatus";
import { ethers } from "ethers";
import { toEth } from "../utils/ether-utils";
import { FaPlus, FaMinus } from "react-icons/fa";
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
	const [action, setAction] = useState("add");
	const [amounts, setAmounts] = useState({
		tokenAAmount: "",
		tokenBAmount: "",
	});
	const [liquidityAmount, setLiquidityAmount] = useState("");
	const [removePercentage, setRemovePercentage] = useState(0);
	const [error, setError] = useState(null);

	// Restablece los valores al abrir el modal
	useEffect(() => {
		setAmounts({
			tokenAAmount: "",
			tokenBAmount: "",
		});
	}, [isModalOpen, setIsModalOpen]);

	const toggleAction = () => {
		setAction((prevAction) => (prevAction === "add" ? "remove" : "add"));
	};

	const handleChangeTokenAmount = (e) => {
		if (!reserves.reserves0 || !reserves.reserves1) return;
		const { name, value } = e.target;
		let orderedReserves0, orderedReserves1;
		if (reserves.name0 === "ETH") {
			orderedReserves0 = reserves.reserves1;
			orderedReserves1 = reserves.reserves0;
		} else {
			orderedReserves0 = reserves.reserves0;
			orderedReserves1 = reserves.reserves1;
		}

		let price = ethers.utils
			.parseUnits(orderedReserves0)
			.div(ethers.utils.parseUnits(orderedReserves1));

		let newAmounts;
		if (name === "tokenAAmount") {
			newAmounts = {
				tokenAAmount: value,
				tokenBAmount: (value / price).toString(),
			};
		} else if (name === "tokenBAmount") {
			newAmounts = {
				tokenAAmount: (value / price).toString(),
				tokenBAmount: value,
			};
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

	const handleAddLiquidity = async () => {
		if (
			isExceedingBalance(amounts.tokenAAmount, signerBalances.srcBalance) ||
			isExceedingBalance(amounts.tokenBAmount, signerBalances.destBalance)
		) {
			setError("Insufficient Balance");
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
			className="modal-content bg-[#18181b] p-6 rounded-3xl max-w-md mx-auto"
			overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
			appElement={document.getElementById("#__next")}
		>
			<div className="text-white">
				<div className="flex items-center justify-between">
					<p className="text-xl mb-4">Liquidity</p>

					{/* Toggle Switch */}
					<div className="flex items-center justify-center mb-4">
						<span className="mr-2 text-gray-400 text-[0.8rem] ">
							<FaPlus />
						</span>
						<label className="relative inline-flex items-center cursor-pointer translate-y-[0.1rem]">
							<input
								type="checkbox"
								checked={action === "remove"}
								onChange={toggleAction}
								className="sr-only"
							/>
							<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-[#44162e] dark:peer-focus:ring-[#44162e] dark:bg-gray-700 peer-checked:bg-[#44162e]">
								<div
									className={`absolute top-[2px] left-[2px] bg-[#44162e] border border-[#44162e] rounded-full h-5 w-5 transition-transform ${
										action === "remove" ? "translate-x-5" : ""
									}`}
								/>
							</div>
						</label>
						<span className="ml-2 text-gray-400 text-[0.8rem]">
							<FaMinus />
						</span>
					</div>
				</div>

				{error && <p className="text-red-500 text-center">{error}</p>}
				{action === "add" ? (
					<div>
						{/* Formulario para añadir liquidez */}
						<div className="mb-4">
							<label>{srcToken.name} amount:</label>
							<input
								name="tokenAAmount"
								type="text"
								value={amounts.tokenAAmount}
								placeholder="0.0"
								className={`w-full p-2 mt-2 rounded-xl h-[3rem] text-3xl py-8 ${
									isExceedingBalance(
										amounts.tokenAAmount,
										signerBalances.srcBalance
									)
										? "text-[#9c5454]"
										: "text-gray-300 bg-[#212429]"
								} focus:outline-none focus:ring-0`}
								onChange={handleChangeTokenAmount}
							/>
							<label>Your balance: {signerBalances.srcBalance}</label>
						</div>
						<div className="mb-4">
							<label>{destToken.name} amount:</label>
							<input
								name="tokenBAmount"
								type="text"
								value={amounts.tokenBAmount}
								placeholder="0.0"
								className={`w-full p-2 mt-2 rounded-xl h-[3rem] text-3xl py-8 ${
									isExceedingBalance(
										amounts.tokenBAmount,
										signerBalances.destBalance
									)
										? "text-[#9c5454]"
										: "text-gray-300 bg-[#212429]"
								} focus:outline-none focus:ring-0`}
								onChange={handleChangeTokenAmount}
							/>
							<label>Your balance: {signerBalances.destBalance}</label>
						</div>
						<button
							className={
								isLoading
									? "w-full p-2 bg-[#1a0911ad] rounded-xl h-[3rem] text-[#000000]"
									: "w-full p-2 bg-[#44162e] rounded-xl h-[3rem] hover:bg-[#351223] text-gray-300"
							}
							onClick={handleAddLiquidity}
							disabled={isLoading}
						>
							{isLoading ? "Processing..." : "Add"}
						</button>
					</div>
				) : (
					<div>
						{/* Formulario para remover liquidez */}
						<div className="mb-4">
							<label>Liquidity Amount:</label>
							<input
								type="text"
								value={liquidityAmount}
								className="w-full p-2 mt-2 bg-[#212429] rounded-xl h-[3rem] text-3xl py-8 text-gray-300"
								onChange={(e) => setLiquidityAmount(e.target.value)}
							/>
							<label>{signerBalances.lpBalance}</label>
						</div>
						<div className="mb-4 rounded-xl">
							<div className="flex justify-between flex-row">
								<label>%</label>
								<label>{removePercentage}%</label>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								value={removePercentage}
								className="w-full mt-2 h-[3rem]"
								onChange={handleSlidePercentage}
							/>
						</div>
						<button
							className={
								isLoading
									? "w-full p-2 bg-[#1a0911ad] rounded-xl h-[3rem] text-[#000000]"
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
