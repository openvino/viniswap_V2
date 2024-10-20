import React, { useState, useEffect } from "react";
import {
	useConnectedWallets,
	useSetActiveWallet,
	useWalletImage,
} from "thirdweb/react";
import { Modal } from "@nextui-org/react";
import useWeb3Store from "../../zustand/store";
import { toEth } from "../../utils/ether-utils";

const WalletModal = ({ open, onClose }) => {
	const wallets = useConnectedWallets();
	const { data: walletImage } = useWalletImage("io.metamask");

	const setActiveWallet = useSetActiveWallet();
	const provider = useWeb3Store.getState().provider;
	const [balances, setBalances] = useState({});

	// Función para obtener el balance de cada wallet
	const getBalance = async (address) => {
		try {
			const balance = await provider?.getBalance(address);
			return balance ? balance.toString() : "0";
		} catch (error) {
			console.error("Error fetching balance", error);
			return "Error";
		}
	};

	useEffect(() => {
		const fetchBalances = async () => {
			const balancePromises = wallets.map(async (wallet) => {
				const balance = await getBalance(wallet.getAccount().address);
				return { address: wallet.getAccount().address, balance };
			});
			const results = await Promise.all(balancePromises);
			const newBalances = results.reduce(
				(acc, curr) => ({
					...acc,
					[curr.address]: curr.balance,
				}),
				{}
			);
			setBalances(newBalances);
		};

		if (wallets.length > 0 && provider) {
			fetchBalances();
		}
	}, [wallets, provider]);

	return (
		<Modal
			className="fixed inset-0 flex items-center justify-center max-w-6xl  w-fit bg-black bg-opacity-75 z-50"
			open={open}
			onClose={() => onClose(false)}
		>
			<div className="bg-[#19191c] rounded-lg p-6 max-w-6xl shadow-lg relative z-50">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b pb-4">
					<h2 className="text-xl font-semibold text-gray-300">Select wallet</h2>
					<button
						className="text-gray-300 hover:text-gray-500 focus:outline-none"
						onClick={() => onClose(false)}
					>
						&times;
					</button>
				</div>

				{/* Wallet List */}
				<div className="mt-4 space-y-4">
					{wallets.map((wallet, index) => (
						<div
							key={index}
							className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-100 transition cursor-pointer"
							onClick={() => {
								setActiveWallet(wallet);
								onClose(false);
							}}
						>
							<div>
								<p className=" flex text-sm font-medium text-gray-300 bg-blue justify-center">
									{wallet.getAccount().address.substring(0, 5)}...
									{wallet.getAccount().address.substring(38)}
								</p>
								<p className="text-xs text-gray-400 justify-center">
									{wallet.id}
								</p>
								<p className="text-sm font-medium text-gray-300 justify-center">
									{balances[wallet.getAccount().address]
										? toEth(balances[wallet.getAccount().address])
										: "loading..."}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
};

export default WalletModal;
