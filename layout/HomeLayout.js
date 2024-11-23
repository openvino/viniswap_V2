import {
	useActiveAccount,
	useActiveWalletChain,
	useNetworkSwitcherModal,
	useSwitchActiveWalletChain,
} from "thirdweb/react";
import Header from "../components/Header";
import useWeb3Store from "../zustand/store";
import { useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { base } from "thirdweb/chains";
import { client } from "../config/thirdwebClient";
import { useRouter } from "next/router";
import { TurnstileWidget } from "../components/turnstileWidget";

const HomeLayout = ({ children }) => {
	const account = useActiveAccount();
	const setProvider = useWeb3Store((state) => state.setProvider);
	const setSigner = useWeb3Store((state) => state.setSigner);
	const setActiveAccount = useWeb3Store((state) => state.setActiveAccount);
	const activeAccount = useWeb3Store((state) => state.activeAccount);

	const router = useRouter();
	const networkSwitcher = useNetworkSwitcherModal();
	const activeChain = useActiveWalletChain();
	const switchChain = useSwitchActiveWalletChain();

	useEffect(() => {
		if (account) {
			(async () => {
				const provider = ethers5Adapter.provider.toEthers({
					client,
					chain: base,
				});
				const signer = await ethers5Adapter.signer.toEthers({
					client: client,
					chain: base,
					account: account,
				});

				setProvider(provider);
				setActiveAccount(account);
				setSigner(signer);
			})();
		} else {
			router.push("/");
		}
	}, [account, activeAccount]);
	useEffect(() => {
		if (account) switchChain(base);
	}, [account, activeAccount]);

	return (
		<div className="flex flex-col min-h-screen overflow-auto">
			<div className="min-w-screen min-h-screen flex flex-col">
				<div className="flex items-center justify-center mb-4 z-[1000] ">
					<Header />
				</div>

				<div className="flex justify-center px-2 md:px-16">{children}</div>

				<div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 ">
					<TurnstileWidget />
				</div>
			</div>
		</div>
	);
};

export default HomeLayout;
