import { useEffect, useRef, useState } from "react";
import { DEFAULT_VALUE, WETH, getCoinAddress } from "../utils/SupportedCoins";
import { ENTER_AMOUNT, defaultSlippage } from "../utils/swap-utils";
import { getPrice, getTokenPrice } from "../utils/queries";

import toast from "react-hot-toast";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { optimismSepolia } from "thirdweb/chains";
import { crowdsaleOvi } from "../config/thirdwebClient";
import { ethers } from "ethers";

const useSwaps = () => {
	const account = useActiveAccount();
	// const { chain } = useNetwork();
	const chain = optimismSepolia;
	const [srcToken, setSrcToken] = useState(WETH);
	const [destToken, setDestToken] = useState(DEFAULT_VALUE);
	const [inputValue, setInputValue] = useState();
	const [outputValue, setOutputValue] = useState();
	const [swapOptionsOpen, setSwapOptionsOpen] = useState(false);
	const [slippage, setSlippage] = useState(defaultSlippage);
	const [swapBtnText, setSwapBtnText] = useState(ENTER_AMOUNT);
	const [txPending, setTxPending] = useState(false);
	const [price, setPrice] = useState({});
	const inValue = useState();
	const outValue = useState();
	const [loading, setLoading] = useState(false);
	const [address, setAddress] = useState(null);

	const { data: ethUsdPriceData } = useReadContract({
		contract: crowdsaleOvi,
		method: "getEthUsdPrice",
		queryOptions: { refetchInterval: 30000 },
	});
	const ethUsdPrice = ethUsdPriceData
		? Number(ethers.utils.formatUnits(ethUsdPriceData, 18))
		: 0;

	useEffect(() => {
		if (account) setAddress(account?.address);
	}, [account]);
	const isReversed = useState(false);

	const srcTokenObj = {
		id: "srcToken",
		value: inputValue,
		setValue: setInputValue,
		defaultValue: srcToken,
		ignoreValue: destToken,
		setToken: setSrcToken,
	};

	const destTokenObj = {
		id: "destToken",
		value: outputValue,
		setValue: setOutputValue,
		defaultValue: destToken,
		ignoreValue: srcToken,
		setToken: setDestToken,
	};

	useEffect(() => {
		const fetchPrice = async (inToken, outToken) => {
			try {
				setLoading(true);
				const address0 = getCoinAddress(inToken);
				const address1 = getCoinAddress(outToken);
				const relativePrices = await getPrice(address0, address1);
				setPrice(relativePrices);
			} catch (error) {
				toast.error(error.message);
				throw new Error("Error");
			} finally {
				setLoading(false);
			}
		};

		if (srcToken && destToken && srcToken !== DEFAULT_VALUE && destToken !== DEFAULT_VALUE)
			fetchPrice(srcToken, destToken);
	}, [srcToken, destToken, chain]);

	useEffect(() => {
		if (!inputValue || !price?.path || price?.token0Reserves === undefined) return;

		try {
			const srcAddress = getCoinAddress(srcToken);
			const inputBN = ethers.utils.parseUnits(inputValue.toString(), 18);
			const r0 = ethers.utils.parseUnits(price.token0Reserves.toString(), 18);
			const r1 = ethers.utils.parseUnits(price.token1Reserves.toString(), 18);
			const trim = (bn) =>
				parseFloat(ethers.utils.formatUnits(bn, 18)).toFixed(8).replace(/\.?0+$/, "");

			if (srcAddress === price.path[0]) {
				setOutputValue(trim(r1.mul(inputBN).div(r0.add(inputBN))));
			} else if (srcAddress === price.path[1]) {
				setOutputValue(trim(r0.mul(inputBN).div(r1.add(inputBN))));
			}
		} catch (_) {}
	}, [price]);

	return {
		srcToken,
		setSrcToken,
		destToken,
		setDestToken,
		inputValue,
		setInputValue,
		outputValue,
		setOutputValue,
		swapOptionsOpen,
		setSwapOptionsOpen,
		slippage,
		setSlippage,

		swapBtnText,
		setSwapBtnText,
		txPending,
		setTxPending,
		inValue,
		outValue,
		isReversed,
		srcTokenObj,
		destTokenObj,
		price,
		setPrice,
		loading,
		address,
		ethUsdPrice,
	};
};

export default useSwaps;
