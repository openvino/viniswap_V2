import React from "react";
import Selector from "./Selector";
import { getCoinAddress, WETH } from "../utils/SupportedCoins";
import { ethers } from "ethers";
import { toEth } from "../utils/ether-utils";
import toast from "react-hot-toast";

const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS;

const formatUsd = (val) => {
  if (!val || val === 0) return null;
  return val.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PriceLoader = () => (
  <div className="flex items-center gap-1 h-8 px-1">
    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
  </div>
);

const SwapField = ({ fieldProps, loading }) => {
  const {
    id,
    value = "",
    setValue,
    defaultValue,
    setToken,
    ignoreValue,
    setCounterPart,
    price,
    srcToken,
    destToken,
    address,
    ethUsdPrice,
  } = fieldProps;

  const isOutput = id === "destToken";
  const currentToken = isOutput ? destToken : srcToken;

  const computeUsdValue = () => {
    const amount = parseFloat(value);
    if (!amount || !ethUsdPrice) return null;

    if (currentToken === WETH) return amount * ethUsdPrice;

    if (!price?.path || !price?.priceToken0InToken1) return null;

    const weth = WETH_ADDRESS?.toLowerCase();
    const tokenPriceInEth =
      price.path[0]?.toLowerCase() === weth
        ? price.priceToken0InToken1
        : price.priceToken1InToken0;

    return amount * tokenPriceInEth * ethUsdPrice;
  };

  const usdValue = computeUsdValue();

  const populateCounterPart = async ({ inputValue }) => {
    try {
      if (!price) return;

      const { path, token0Reserves, token1Reserves } = price;

      if (!path || token0Reserves === undefined || token1Reserves === undefined) return;

      if (inputValue === "") {
        setCounterPart("");
        return;
      }

      const CurrentTokenAddress =
        id === "srcToken" ? getCoinAddress(srcToken) : getCoinAddress(destToken);

      if (!CurrentTokenAddress) return;

      const inputAmountBN = ethers.utils.parseUnits(inputValue, 18);
      const token0ReservesBN = ethers.utils.parseUnits(token0Reserves.toString(), 18);
      const token1ReservesBN = ethers.utils.parseUnits(token1Reserves.toString(), 18);

      const trim = (val) => parseFloat(toEth(val)).toFixed(8).replace(/\.?0+$/, "");

      if (CurrentTokenAddress === path[0]) {
        const outputAmount = token1ReservesBN
          .mul(inputAmountBN)
          .div(token0ReservesBN.add(inputAmountBN));
        setCounterPart(trim(outputAmount));
      }

      if (CurrentTokenAddress === path[1]) {
        const outputAmount = token0ReservesBN
          .mul(inputAmountBN)
          .div(token1ReservesBN.add(inputAmountBN));
        setCounterPart(trim(outputAmount));
      }
    } catch (error) {
      console.error("Error in populateCounterPart:", error);
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    populateCounterPart({ inputValue: e.target.value });
  };

  return (
    <div className="flex items-center w-full gap-3 rounded-xl">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-gray-500 mb-1 px-1">
          {isOutput ? "To" : "From"}
        </span>
        {loading && isOutput ? (
          <PriceLoader />
        ) : (
          <input
            disabled={!address}
            className="w-full outline-none h-8 px-1 appearance-none text-3xl bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            type="number"
            value={value}
            placeholder="0.0"
            onChange={handleChange}
          />
        )}
        <span className="text-xs text-gray-500 px-1 mt-1 h-4">
          {usdValue ? formatUsd(usdValue) : ""}
        </span>
      </div>
      <Selector
        id={id}
        setToken={setToken}
        defaultValue={defaultValue}
        ignoreValue={ignoreValue}
      />
    </div>
  );
};

export default SwapField;
