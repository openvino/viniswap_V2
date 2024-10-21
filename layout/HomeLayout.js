import { useActiveAccount } from "thirdweb/react";
import Header from "../components/Header";
import useWeb3Store from "../zustand/store";
import { useEffect } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { baseSepolia } from "thirdweb/chains";
import { client, clientLegacy } from "../config/thirdwebClient";

const HomeLayout = ({ children }) => {
	const account = useActiveAccount();
	const setProvider = useWeb3Store((state) => state.setProvider);
	const setSigner = useWeb3Store((state) => state.setSigner);

	const setActiveAccount = useWeb3Store((state) => state.setActiveAccount);
	const activeAccount = useWeb3Store((state) => state.activeAccount);

	useEffect(() => {
		if (account) {
			(async () => {
				const provider = ethers5Adapter.provider.toEthers({
					client,
					chain: baseSepolia,
				});
				const signer = await ethers5Adapter.signer.toEthers({
					client: client,
					chain: baseSepolia,
					account: account,
				});

				setActiveAccount(account);
				setProvider(provider);
				setSigner(signer);
			})();
		}
	}, [account, activeAccount]);

	return (
		// <div className="min-w-screen min-h-screen flex flex-col bg-[#2D242F]">
		<div className="flex flex-col min-h-screen  overflow-auto ">
			<div className="min-w-screen min-h-screen flex flex-col ">
				<div className="flex items-center justify-center mb-8">
					<Header />
				</div>

				<div className="flex  justify-center  mt-16 px-2 md:px-16">
					{children}
				</div>
			</div>
		</div>
	);
};

export default HomeLayout;
