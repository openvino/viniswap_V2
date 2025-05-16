  import Image from "next/image";
  import NavItems from "../../components/NavItems";
  import HomeLayout from "../../layout/HomeLayout";
  import { getSwapBtnClassName } from "../../utils/swap-utils";
  import OviTokenInput from "../../components/OviTokenInput";
  import { useReadContract, useSendTransaction } from "thirdweb/react";
  import { crowdsaleOvi } from "../../config/thirdwebClient";
  import { useState, useEffect } from "react";
  import { prepareContractCall, toWei } from "thirdweb";
  import { ethers } from "ethers";

  export default function Index() {
    const [tokenAmount, setTokenAmount] = useState(1);
    const [usdTotal, setUsdTotal] = useState(0);
    const [ethNeeded, setEthNeeded] = useState(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(1);
    const [tokensSold, setTokensSold] = useState(0);
    const [phaseOneCap, setPhaseOneCap] = useState(0);

    // Leer tarifas y datos de contrato
    const { data: rateData, isLoading: rateLoading } = useReadContract({
      contract: crowdsaleOvi,
      method: "getRate",
    });

    const { data: tokensPerEthData, isLoading: tokensPerEthLoading } = useReadContract({
      contract: crowdsaleOvi,
      method: "getTokenAmount",
      params: [ethers.utils.parseEther("1").toString()],
    });

    const { data: weiAmountData, isLoading: weiAmountLoading } = useReadContract({
    contract: crowdsaleOvi,
    method: "getWeiAmount",
    params: [ethers.utils.parseUnits(tokenAmount.toString(), 18).toString()],
  });

  const { data: ethUsdPriceData } = useReadContract({
    contract: crowdsaleOvi,
    method: "getEthUsdPrice",
  });


    const { data: tokensSoldData } = useReadContract({
      contract: crowdsaleOvi,
      method: "tokensSold",
    });

    const { data: phaseOneTokenCapData } = useReadContract({
      contract: crowdsaleOvi,
      method: "phaseOneTokenCap",
    });

    useEffect(() => {
    if (
      ethNeeded &&
      ethUsdPriceData &&
      !isNaN(Number(ethNeeded))
    ) {
      const ethUsd = Number(ethers.utils.formatUnits(ethUsdPriceData, 18));
      const usd = parseFloat(ethNeeded) * ethUsd;
      setUsdTotal(usd);
    }
  }, [ethNeeded, ethUsdPriceData]);


    const rate = rateData ? Number(rateData) / 1e18 : 0;
    const tokensPerEth = tokensPerEthData ? Number(tokensPerEthData) / 1e18 : 0;

    // Convertir bigNumbers a números y calcular progreso
    useEffect(() => {
      if (tokensSoldData && phaseOneTokenCapData) {
        const sold = Number(ethers.utils.formatUnits(tokensSoldData, 18));
        const cap = Number(ethers.utils.formatUnits(phaseOneTokenCapData, 18));
        setTokensSold(sold);
        setPhaseOneCap(cap);

        const phase = sold >= cap ? 2 : 1;
        setCurrentPhase(phase);

        const progress = Math.min((sold / cap) * 100, 100);
        setProgressPercent(progress);
      }
    }, [tokensSoldData, phaseOneTokenCapData]);

    // Cálculo de USD total y ETH necesario
    useEffect(() => {
    if (!weiAmountLoading && weiAmountData && tokenAmount > 0) {
      const ethFormatted = ethers.utils.formatEther(weiAmountData.toString());
      setEthNeeded(ethFormatted);
    } else {
      setEthNeeded(null);
    }
  }, [weiAmountLoading, weiAmountData, tokenAmount]);


    const isReady = ethNeeded !== null && ethNeeded !== "0.000000";

    // Enviar transacción
    const { mutate: sendTransaction, isLoading: txLoading } = useSendTransaction();

    const handleBuyTokens = async () => {
      if (!isReady) return;

      const tx = prepareContractCall({
        contract: crowdsaleOvi,
        method: "buyTokens",
        value: toWei(ethNeeded),
      });

      try {
        const result = await sendTransaction(tx);
        console.log("Transaction sent:", result);
      } catch (err) {
        console.error("Transaction error:", err);
      }
    };

    return (
      <HomeLayout>
        <div className="p-6 rounded-3xl w-full max-w-[480px] bg-zinc-800 text-white shadow-lg mx-auto mt-24 space-y-6">
  <NavItems />

  <h2 className="text-2xl text-center font-bold tracking-wide">Buy OVI Tokens</h2>

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
      {rateLoading ? "…" : `$${rate.toFixed(2)} USD`}
    </p>
    <p className="text-zinc-300">
      <span className="font-medium text-white">Total:</span>{" "}
      {usdTotal === 0 ? "Calculating…" : `$${usdTotal.toFixed(2)} USD`}
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
      {Math.ceil(tokensSold).toLocaleString()} / {Math.ceil(phaseOneCap).toLocaleString()} OVI
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
                ${isReady && !txLoading
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-zinc-600 text-zinc-300 cursor-not-allowed"}`}
  >
    {txLoading ? "Processing..." : isReady ? "Buy Tokens" : "Calculating..."}
  </button>
</div>

      </HomeLayout>
    );
  }
