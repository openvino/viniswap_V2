import Image from "next/image";
import NavItems from "../../components/NavItems";
import HomeLayout from "../../layout/HomeLayout";
import OviTokenInput from "../../components/OviTokenInput";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { crowdsaleOvi } from "../../config/thirdwebClient";
import { useState, useEffect, useMemo } from "react";
import { prepareContractCall, toWei } from "thirdweb";
import { ethers } from "ethers";

const formatUsd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Calculating…";
  if (amount === 0) return "$0 USD";

  const absAmount = Math.abs(amount);
  const maximumFractionDigits = absAmount < 0.000001 ? 18 : 12;

  return `${amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  })} USD`;
};

export default function Index() {
  const [tokenAmount, setTokenAmount] = useState("1");
  const [usdTotal, setUsdTotal] = useState(0);
  const [ethNeeded, setEthNeeded] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [tokensSold, setTokensSold] = useState(0);
  const [phaseOneCap, setPhaseOneCap] = useState(0);
  const [txMessage, setTxMessage] = useState(null);
  const [tokensAvailable, setTokensAvailable] = useState(0);

  // Leer tarifas y datos de contrato
  const { data: rateData, isLoading: rateLoading } = useReadContract({
    contract: crowdsaleOvi,
    method: "getRate",
    queryOptions: { refetchInterval: 15000 },
  });

  const sanitizedTokenAmount =
    tokenAmount === "" || tokenAmount === "."
      ? "0"
      : tokenAmount.endsWith(".")
      ? tokenAmount.slice(0, -1)
      : tokenAmount;

  const weiAmountParam = useMemo(() => {
    try {
      return ethers.utils.parseUnits(sanitizedTokenAmount, 18).toString();
    } catch (err) {
      return "0";
    }
  }, [sanitizedTokenAmount]);

  const {
    data: tokensPerEthData,
    isLoading: tokensPerEthLoading,
    refetch: refetchTokensPerEth,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "getTokenAmount",
    params: [ethers.utils.parseEther("1").toString()],
    queryOptions: { refetchInterval: 15000 },
  });

  const {
    data: weiAmountData,
    isLoading: weiAmountLoading,
    refetch: refetchWeiAmount,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "getWeiAmount",
    params: [
      weiAmountParam,
    ],
  });

  const {
    data: ethUsdPriceData,
    refetch: refetchEthUsdPrice,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "getEthUsdPrice",
    queryOptions: { refetchInterval: 15000 },
  });

  const {
    data: tokensSoldData,
    refetch: refetchTokensSold,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "tokensSold",
    queryOptions: { refetchInterval: 15000 },
  });

  const {
    data: phaseOneTokenCapData,
    refetch: refetchPhaseOneCap,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "phaseOneTokenCap",
    queryOptions: { refetchInterval: 15000 },
  });

  const {
    data: crowdsaleBalanceData,
    isLoading: crowdsaleBalanceLoading,
    refetch: refetchCrowdsaleBalance,
  } = useReadContract({
    contract: crowdsaleOvi,
    method: "balanceOfCrowdsale",
    queryOptions: { refetchInterval: 15000 },
  });

  useEffect(() => {
    if (ethNeeded && ethUsdPriceData && !isNaN(Number(ethNeeded))) {
      const ethUsd = Number(ethers.utils.formatUnits(ethUsdPriceData, 18));
      const usd = parseFloat(ethNeeded) * ethUsd;
      setUsdTotal(usd);
    } else {
      setUsdTotal(0);
    }
  }, [ethNeeded, ethUsdPriceData]);

  const rate = rateData ? Number(rateData) / 1e18 : 0;
  const tokensPerEth = tokensPerEthData
    ? Number(ethers.utils.formatUnits(tokensPerEthData, 18))
    : 0;
  const crowdsaleBalance = crowdsaleBalanceData
    ? Number(ethers.utils.formatUnits(crowdsaleBalanceData, 18))
    : 0;

  // Convertir bigNumbers a números y calcular progreso
  useEffect(() => {
    const sold = Number(ethers.utils.formatUnits(tokensSoldData || 0, 18));
    const cap = Number(ethers.utils.formatUnits(phaseOneTokenCapData || 0, 18));
    setTokensSold(sold);
    setPhaseOneCap(cap);

    if (cap === 0) {
      setProgressPercent(0);
      return;
    }

    const phase = sold >= cap ? 2 : 1;
    setCurrentPhase(phase);

    const progress = Math.min((sold / cap) * 100, 100);
    setProgressPercent(progress);
  }, [tokensSoldData, phaseOneTokenCapData]);

  useEffect(() => {
    setTokensAvailable(crowdsaleBalance);
  }, [crowdsaleBalance]);

  useEffect(() => {
    const asNumber = Number(sanitizedTokenAmount);
    if (asNumber > tokensAvailable && tokensAvailable > 0) {
      setTokenAmount(tokensAvailable.toString());
    }
  }, [tokensAvailable, sanitizedTokenAmount]);

  // Cálculo de USD total y ETH necesario
  useEffect(() => {
    if (!weiAmountLoading && weiAmountData && Number(sanitizedTokenAmount) > 0) {
      const ethFormatted = ethers.utils.formatEther(weiAmountData.toString());
      setEthNeeded(ethFormatted);
    } else {
      setEthNeeded(null);
    }
  }, [weiAmountLoading, weiAmountData, sanitizedTokenAmount]);

  const isReady =
    ethNeeded !== null &&
    Number(ethNeeded) > 0 &&
    tokensAvailable > 0 &&
    Number(sanitizedTokenAmount) > 0 &&
    Number(sanitizedTokenAmount) <= tokensAvailable;

  // Enviar transacción
  const { mutateAsync: sendTransaction, isLoading: txLoading } =
    useSendTransaction();

  const handleBuyTokens = async () => {
    if (!isReady) return;
    setTxMessage(null);

    const tx = prepareContractCall({
      contract: crowdsaleOvi,
      method: "buyTokens",
      value: toWei(ethNeeded),
    });

    try {
      const result = await sendTransaction(tx);
      console.log("Transaction sent:", result);
      setTxMessage("Compra enviada. Esperando confirmación...");
      // refrescar datos on-chain tras la compra
      await Promise.allSettled([
        refetchTokensSold?.(),
        refetchPhaseOneCap?.(),
        refetchWeiAmount?.(),
        refetchTokensPerEth?.(),
        refetchEthUsdPrice?.(),
        refetchCrowdsaleBalance?.(),
      ]);
      setTxMessage("Compra confirmada. Datos actualizados.");
    } catch (err) {
      console.error("Transaction error:", err);
      setTxMessage("Error al procesar la compra. Revisa la consola.");
    }
  };

  return (
    <HomeLayout>
      <div className="p-6 rounded-3xl w-full max-w-[480px] bg-zinc-800 text-white shadow-lg mx-auto mt-24 space-y-6">
        <NavItems />

        <h2 className="text-2xl text-center font-bold tracking-wide">
          Buy OVI Tokens
        </h2>

        <div className="flex justify-center">
          <Image
            src="/tokens/token.png"
            width={200}
            height={200}
            alt="OVI Token"
            className="rounded-full"
          />
        </div>

        <div className="bg-zinc-700 p-5 rounded-xl border border-zinc-600">
          <OviTokenInput value={tokenAmount} onChange={setTokenAmount} />
        </div>

        <div className="text-sm space-y-1">
          <p className="text-zinc-300">
            <span className="font-medium text-white">Price per token:</span>{" "}
            {rateLoading ? "…" : formatUsd(rate)}
          </p>
          <p className="text-zinc-300">
            <span className="font-medium text-white">With 1 ETH you get:</span>{" "}
            {tokensPerEthLoading ? "…" : `${tokensPerEth.toLocaleString()} OVI`}
          </p>
          <p className="text-zinc-300">
            <span className="font-medium text-white">Total:</span>{" "}
            {ethNeeded === null || !ethUsdPriceData
              ? "Calculating…"
              : formatUsd(usdTotal)}
          </p>
          <p className="text-zinc-300">
            <span className="font-medium text-white">You will send:</span>{" "}
            {ethNeeded === null ? "Calculating…" : `${ethNeeded} ETH`}
          </p>
        </div>

        <div className="text-sm text-zinc-300 space-y-1">
          <p>
            <span className="font-medium text-white">Current phase:</span>{" "}
            {currentPhase === 1 ? "Phase 1" : "Phase 2"}
          </p>
          <p>
            <span className="font-medium text-white">Sold:</span>{" "}
            {Math.ceil(tokensSold).toLocaleString()} /{" "}
            {Math.ceil(phaseOneCap).toLocaleString()} OVI
          </p>
          <p>
            <span className="font-medium text-white">Tokens disponibles:</span>{" "}
            {crowdsaleBalanceLoading
              ? "…"
              : Math.floor(tokensAvailable).toLocaleString()}{" "}
            OVI
          </p>
        </div>

        <div className="w-full h-4 bg-zinc-600 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <button
          onClick={handleBuyTokens}
          disabled={!isReady || txLoading}
          className={`w-full py-3 mt-4 rounded-xl text-lg font-semibold transition 
                ${
                  isReady && !txLoading
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-zinc-600 text-zinc-300 cursor-not-allowed"
                }`}
        >
          {txLoading
            ? "Processing..."
            : isReady
            ? "Buy Tokens"
            : "Calculating..."}
        </button>
        {txMessage && (
          <p className="text-sm text-center text-zinc-300">{txMessage}</p>
        )}
      </div>
    </HomeLayout>
  );
}
