"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
	routerContract,
	factoryContract,
	pairContract,
} from "../utils/contract";

import { toEth } from "../utils/ether-utils";
import { whitelistedPools } from "../utils/whitelistedPools";
import { DEFAULT_VALUE, getCoinName, WETH } from "../utils/SupportedCoins";
import { useActiveAccount } from "thirdweb/react";

export const usePools = () => {
	const account = useActiveAccount();
	const whitelisted = whitelistedPools;
	const [pools, setPools] = useState([]);
	const [refresh, setRefresh] = useState(0);
	const [refreshDisabled, setRefreshDisabled] = useState(false);
	const [reserves, setReserves] = useState({});
	const [inputValue, setInputValue] = useState("");
	const [outputValue, setOutputValue] = useState("");

	const [isReversed, setIsReversed] = useState(false);
	const [srcToken, setSrcToken] = useState({
		name: DEFAULT_VALUE,
		address: "",
	});
	console.log({
		name: WETH,
		address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
		account,
	});

	const [destToken, setDestToken] = useState({
		name: WETH,
		address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
	});

	const [address, setAddress] = useState(null);

	useEffect(() => {
		if (account) setAddress(account?.address);
	}, [account]);

	const srcTokenObj = {
		id: "srcToken",
		value: reserves.reverse ? reserves.reserves1 : reserves.reserves0,
		setValue: setInputValue,
		defaultValue: srcToken.name,
		ignoreValue: destToken,
		setToken: setSrcToken,
	};

	const destTokenObj = {
		id: "destToken",
		value: reserves.reverse ? reserves.reserves0 : reserves.reserves1,
		setValue: setOutputValue,
		defaultValue: WETH,
		ignoreValue: srcToken,
		setToken: setDestToken,
	};

	useEffect(() => {
		const fetchPools = async () => {
			if (!account?.address) {
				return;
			}

			try {
				const factory = await factoryContract();
				const pairsCount = await factory.allPairsLength();

				const pairsPromises = [];
				for (let i = 0; i < pairsCount; i++) {
					pairsPromises.push(factory.allPairs(i));
				}

				const pairAddresses = await Promise.all(pairsPromises);

				const poolDataPromises = pairAddresses.map(async (pairAddress) => {
					const pairObj = await pairContract(pairAddress);
					const reserves = await pairObj.getReserves();
					const tokenAddress0 = await pairObj.token0();
					const tokenAddress1 = await pairObj.token1();

					return {
						address: pairAddress,
						reserves0: toEth(reserves[0].toString()),
						reserves1: toEth(reserves[1].toString()),
						timeStamp: reserves[2].toString(),
						token0: tokenAddress0,
						token1: tokenAddress1,
						name0: getCoinName(tokenAddress0),
						name1: getCoinName(tokenAddress1),
					};
				});

				const poolsArray = await Promise.all(poolDataPromises);
				setPools(poolsArray);
				refreshAmounts();
				console.log("poolsArray:", poolsArray);
			} catch (error) {
				console.error("Error fetching pools:", error);
			}
		};

		fetchPools();
	}, [refresh, address]);

	// useEffect(() => {
	// 	const fetchPools = async () => {
	// 		if (!account?.address) {
	// 			return;
	// 		}
	// 		let poolsArray = [];

	// 		const factory = await factoryContract();
	// 		const pairsCount = await factory.allPairsLength();

	// 		for (let i = 0; i < pairsCount; i++) {
	// 			const pairAddress = await factory.allPairs(i);
	// 			const pairObj = await pairContract(pairAddress);
	// 			const reserves = await pairObj.getReserves();
	// 			const tokenAddress0 = await pairObj.token0();
	// 			const tokenAddress1 = await pairObj.token1();
	// 			const poolObj = {
	// 				address: pairAddress,
	// 				reserves0: toEth(reserves[0].toString()),
	// 				reserves1: toEth(reserves[1].toString()),
	// 				timeStamp: reserves[2].toString(),
	// 				token0: tokenAddress0,
	// 				token1: tokenAddress1,
	// 				name0: getCoinName(tokenAddress0),
	// 				name1: getCoinName(tokenAddress1),
	// 			};

	// 			poolsArray.push({ ...poolObj });
	// 			console.log("poolsArray:", poolsArray);
	// 		}
	// 		setPools(poolsArray);
	// 	};

	// 	fetchPools();
	// }, [refresh, address]);

	const refreshAmounts = () => {
		console.log("refreshing reserves...");
		if (!refreshDisabled) {
			setRefresh(refresh + 1);
			setRefreshDisabled(true);
			setTimeout(() => {
				setRefreshDisabled(false);
			}, 10000);
		}
	};

	return {
		pools,
		setRefresh,
		refresh,
		refreshAmounts,
		refreshDisabled,
		reserves,
		setReserves,
		srcToken,
		destToken,
		setSrcToken,
		setDestToken,
		srcTokenObj,
		destTokenObj,
		isReversed,
		setIsReversed,
		inputValue,
		setInputValue,
		outputValue,
		setOutputValue,
		address,
	};
};
