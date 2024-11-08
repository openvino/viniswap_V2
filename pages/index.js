"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HomeLayout from "../layout/HomeLayout";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { defineChain, optimismSepolia } from "thirdweb/chains";
import { accountAbstraction, client } from "../config/thirdwebClient";

export default function Home() {
	const account = useActiveAccount();
	const router = useRouter();
	const [address, setAddress] = useState(null);

	useEffect(() => {
		if (account) setAddress(account?.address);
	}, [account]);

	useEffect(() => {
		if (address) {
			router.push("/swap");
		}
	}, [address, router]);

	if (!address)
		return (
			<div className="flex justify-center items-center h-screen bg-black">
				<ConnectButton
					client={client}
					// accountAbstraction={accountAbstraction}

					connectButton={{
						label: "Connect Wallet",
						style: {
							padding: "12px 24px",
							background: "#fff",
							color: "#840c4a",
							fontSize: "20px",
							fontWeight: "bold",
							borderRadius: "12px",
							boxShadow:
								"0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
						},
					}}
				/>
			</div>
		);

	return <HomeLayout />;
}
