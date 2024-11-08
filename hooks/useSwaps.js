import { useEffect, useRef, useState } from "react";
import { DEFAULT_VALUE, WETH, getCoinAddress } from "../utils/SupportedCoins";
import { ENTER_AMOUNT, defaultSlippage } from "../utils/swap-utils";
import { getPrice, getTokenPrice } from "../utils/queries";

import toast from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import { optimismSepolia } from "thirdweb/chains";

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

		if (srcToken && destToken) fetchPrice(srcToken, destToken);
	}, [srcToken, destToken, chain]);

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
	};
};

export default useSwaps;
