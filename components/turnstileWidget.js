import React, { useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import useWeb3Store from "../zustand/store";

const SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY;

export const TurnstileWidget = () => {
	const setIsHuman = useWeb3Store((state) => state.setIsHuman);
	const [key, setKey] = useState(0);

	const handleVerify = async (token) => {
		try {
			const response = await fetch("/api/cloudflare", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token }),
			});

			const result = await response.json();
			console.log(result?.success);

			setIsHuman(result?.success || false);
		} catch (error) {
			setIsHuman(false);
			console.error("Error verifying token:", error);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setKey((prevKey) => prevKey + 1);
		}, 60000);

		return () => clearInterval(interval);
	}, []);

	return (
		<Turnstile
			key={key}
			sitekey={SITE_KEY}
			onVerify={handleVerify}
			theme="dark"
			size="normal"
			style={{
				transform: "scale(0.75) translate(0, 650px)",
			}}
		/>
	);
};
