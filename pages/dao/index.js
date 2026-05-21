import NavItems from "../../components/NavItems";
import HomeLayout from "../../layout/HomeLayout";
import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { crowdsaleOvi } from "../../config/thirdwebClient";
import { useState, useEffect, useMemo } from "react";
import { prepareContractCall, toWei } from "thirdweb";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const formatUsd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return null;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Index() {
  const account = useActiveAccount();
  const [tokenAmount, setTokenAmount] = useState("");
  const [usdTotal, setUsdTotal] = useState(0);
  const [ethNeeded, setEthNeeded] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [tokensSold, setTokensSold] = useState(0);
  const [phaseOneCap, setPhaseOneCap] = useState(0);
  const [tokensAvailable, setTokensAvailable] = useState(0);

  const sanitizedTokenAmount =
    tokenAmount === "" || tokenAmount === "." ? "0"
    : tokenAmount.endsWith(".") ? tokenAmount.slice(0, -1)
    : tokenAmount;

  const weiAmountParam = useMemo(() => {
    try { return ethers.utils.parseUnits(sanitizedTokenAmount, 18).toString(); }
    catch { return "0"; }
  }, [sanitizedTokenAmount]);

  const { data: rateData } = useReadContract({ contract: crowdsaleOvi, method: "getRate", queryOptions: { refetchInterval: 15000 } });
  const { data: tokensPerEthData, isLoading: tokensPerEthLoading } = useReadContract({ contract: crowdsaleOvi, method: "getTokenAmount", params: [ethers.utils.parseEther("1").toString()], queryOptions: { refetchInterval: 15000 } });
  const { data: weiAmountData, isLoading: weiAmountLoading, refetch: refetchWeiAmount } = useReadContract({ contract: crowdsaleOvi, method: "getWeiAmount", params: [weiAmountParam] });
  const { data: ethUsdPriceData, refetch: refetchEthUsdPrice } = useReadContract({ contract: crowdsaleOvi, method: "getEthUsdPrice", queryOptions: { refetchInterval: 15000 } });
  const { data: tokensSoldData, refetch: refetchTokensSold } = useReadContract({ contract: crowdsaleOvi, method: "tokensSold", queryOptions: { refetchInterval: 15000 } });
  const { data: phaseOneTokenCapData, refetch: refetchPhaseOneCap } = useReadContract({ contract: crowdsaleOvi, method: "phaseOneTokenCap", queryOptions: { refetchInterval: 15000 } });
  const { data: crowdsaleBalanceData, isLoading: crowdsaleBalanceLoading, refetch: refetchCrowdsaleBalance } = useReadContract({ contract: crowdsaleOvi, method: "balanceOfCrowdsale", queryOptions: { refetchInterval: 15000 } });

  const rate = rateData ? Number(rateData) / 1e18 : 0;
  const tokensPerEth = tokensPerEthData ? Number(ethers.utils.formatUnits(tokensPerEthData, 18)) : 0;
  const crowdsaleBalance = crowdsaleBalanceData ? Number(ethers.utils.formatUnits(crowdsaleBalanceData, 18)) : 0;
  const ethUsdPrice = ethUsdPriceData ? Number(ethers.utils.formatUnits(ethUsdPriceData, 18)) : 0;

  useEffect(() => {
    if (ethNeeded && ethUsdPrice) setUsdTotal(parseFloat(ethNeeded) * ethUsdPrice);
    else setUsdTotal(0);
  }, [ethNeeded, ethUsdPrice]);

  useEffect(() => {
    const sold = Number(ethers.utils.formatUnits(tokensSoldData || 0, 18));
    const cap = Number(ethers.utils.formatUnits(phaseOneTokenCapData || 0, 18));
    setTokensSold(sold);
    setPhaseOneCap(cap);
    if (cap > 0) {
      setCurrentPhase(sold >= cap ? 2 : 1);
      setProgressPercent(Math.min((sold / cap) * 100, 100));
    }
  }, [tokensSoldData, phaseOneTokenCapData]);

  useEffect(() => { setTokensAvailable(crowdsaleBalance); }, [crowdsaleBalance]);

  useEffect(() => {
    if (!weiAmountLoading && weiAmountData && Number(sanitizedTokenAmount) > 0)
      setEthNeeded(ethers.utils.formatEther(weiAmountData.toString()));
    else setEthNeeded(null);
  }, [weiAmountLoading, weiAmountData, sanitizedTokenAmount]);

  const isReady = ethNeeded !== null && Number(ethNeeded) > 0 && tokensAvailable > 0
    && Number(sanitizedTokenAmount) > 0 && Number(sanitizedTokenAmount) <= tokensAvailable;

  const { mutateAsync: sendTransaction, isLoading: txLoading } = useSendTransaction();

  const handleBuyTokens = async () => {
    if (!isReady) return;
    try {
      const tx = prepareContractCall({ contract: crowdsaleOvi, method: "buyTokens", value: toWei(ethNeeded) });
      await sendTransaction(tx);
      toast.success("Purchase confirmed!");
      setTokenAmount("");
      await Promise.allSettled([
        refetchTokensSold?.(), refetchPhaseOneCap?.(), refetchWeiAmount?.(),
        refetchEthUsdPrice?.(), refetchCrowdsaleBalance?.(),
      ]);
    } catch (err) {
      toast.error("Transaction failed. Please try again.", { duration: 6000 });
    }
  };

  const handleQuickAmount = (amount) => {
    if (amount <= tokensAvailable) setTokenAmount(amount.toString());
  };

  const btnLabel = !account ? "Connect wallet"
    : txLoading ? "Processing..."
    : isReady ? "Buy OVI"
    : Number(sanitizedTokenAmount) === 0 || tokenAmount === "" ? "Enter an amount"
    : "Calculating…";

  const btnActive = account && isReady && !txLoading;

  return (
    <HomeLayout>
      <div className="p-5 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900 text-white mb-24">
        {/* Nav */}
        <div className="flex md:px-4 mb-4">
          <NavItems />
        </div>

        <div className="flex items-center justify-between px-1 mb-4">
          <p>Buy OVI</p>
        </div>

        {/* Main input */}
        <div className="bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600">
          <p className="text-xs text-zinc-500 mb-3">You buy</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              value={tokenAmount}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*\.?\d*$/.test(v)) setTokenAmount(v);
              }}
              placeholder="0"
              className="bg-transparent outline-none text-3xl text-white w-full placeholder-zinc-600"
            />
            <div className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-2xl flex-shrink-0">
              <img src="/tokens/token.png" alt="OVI" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-white font-semibold text-sm whitespace-nowrap">OVI</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2 h-4">
            {formatUsd(usdTotal) ?? ""}
          </p>
          {/* Quick amounts */}
          <div className="flex gap-2 mt-4">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* ETH to pay */}
        <div className="bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600">
          <p className="text-xs text-zinc-500 mb-3">You pay</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl text-white w-full">
              {weiAmountLoading && tokenAmount !== ""
                ? <span className="text-zinc-500 text-xl">Calculating…</span>
                : ethNeeded && Number(ethNeeded) > 0
                  ? parseFloat(ethNeeded).toFixed(8).replace(/\.?0+$/, "")
                  : <span className="text-zinc-600">0</span>
              }
            </p>
            <div className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-2xl flex-shrink-0">
              <img src="/eth.png" alt="ETH" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-white font-semibold text-sm">ETH</span>
            </div>
          </div>
          {tokensPerEth > 0 && (
            <p className="text-xs text-zinc-500 mt-2">
              1 ETH = {tokensPerEth.toLocaleString()} OVI
              {rate > 0 && ` · ${formatUsd(rate)} per token`}
            </p>
          )}
        </div>

        {/* Sale info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Phase {currentPhase}</span>
            <span>{Math.ceil(tokensSold).toLocaleString()} / {Math.ceil(phaseOneCap).toLocaleString()} OVI sold</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#840c4a] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>{progressPercent.toFixed(1)}% sold</span>
            <span>{crowdsaleBalanceLoading ? "…" : Math.floor(tokensAvailable).toLocaleString()} OVI available</span>
          </div>
        </div>

        {/* Buy button */}
        <button
          onClick={handleBuyTokens}
          disabled={!btnActive}
          className={`p-4 w-full my-4 rounded-xl font-semibold text-base transition-all duration-200 text-white ${
            btnActive
              ? "bg-[#840c4a] hover:bg-[#9e1058] shadow-lg shadow-[#840c4a]/30 cursor-pointer"
              : "bg-zinc-700 opacity-60 pointer-events-none"
          }`}
        >
          {btnLabel}
        </button>

        <Toaster />
      </div>
    </HomeLayout>
  );
}
