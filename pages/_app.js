import { useEffect, useState } from "react";
import "../styles/globals.css";
import Head from "next/head";

import { ThirdwebProvider } from "thirdweb/react";
import Modal from "react-modal";

Modal.setAppElement("#__next");

function MyApp({ Component, pageProps }) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);
	if (!isClient) {
		return null; //loader
	}

	return (
		<ThirdwebProvider>
			<Head>
				<title>Viniswap | OpenVino DEX</title>
				<meta name="description" content="Buy and sell tokenized wine on the OpenVino decentralized exchange" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col min-h-screen  mb-10">
				<div className="flex-grow">
					<Component {...pageProps} />
				</div>
			</div>
		</ThirdwebProvider>
	);
}

export default MyApp;
