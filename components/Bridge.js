import React, { useEffect, useState } from "react";
import { CogIcon, ArrowSmRightIcon } from "@heroicons/react/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import NavItems from "./NavItems";
import { CONNECT_WALLET, CONFIRM } from "../utils/swap-utils";
import { tokens } from "../utils/tokens";
import useBridge from "../hooks/useBridge";
import {
  increaseBridgeAllowance,
  mintOpToken,
  transferTokenToOP,
} from "../utils/queries";
import { switchNetwork } from "../utils/bridge-utils";
import { Modal } from "@nextui-org/react";
import { Oval } from "react-loader-spinner";
const Bridge = () => {
  const { chain } = useNetwork();
  const [steps, setSteps] = useState("step1");
  const [tokenAddress, setTokenAddress] = useState(tokens[0].address);
  const [bridgeBtnText, setBridgeBtnText] = useState(CONNECT_WALLET);
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amountTokens, setAmountTokens] = useState(0);
  const { balance } = useBridge(tokenAddress, address);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (chain?.id !== 10 && steps !== "step3" && steps !== "step4") {
        try {
          await switchNetwork(10);
        } catch (error) {
          toast.error("Please switch to the Sepolia network");
        }
      }
    };

    checkNetwork();
  }, [chain]);

  const handleTokenChange = (event, selectedAddress) => {
    const selected = tokens.find((token) => token.name === event.target.value);
    setSelectedToken(selected);
    setTokenAddress(selected.address);
  };

  const handleAmountChange = (event) => {
    const newValue = event.target.value;
    // Permite solo números enteros y no negativos
    if (/^\d*$/.test(newValue)) {
      const numericValue = parseInt(newValue, 10);
      // Compara el valor numérico con el balance
      if (numericValue > balance) {
        toast.error("Insufficient balance");
      } else {
        setAmountTokens(newValue);
      }
    }
  };

  const requestBridge = async () => {
    setLoading(true);
    setSteps("step1");

    setOpen(true);
    const checkNetwork = async () => {
      if (chain?.id !== 10) {
        try {
          await switchNetwork(10);
        } catch (error) {
          toast.error("Please switch to the Sepolia network");
        }
      }
    };

    checkNetwork();
    try {
      if (amountTokens > balance) {
        toast.error("Insufficient balance");
      }

      //allowance

      const allowance = await increaseBridgeAllowance(
        amountTokens,
        selectedToken.address,
        selectedToken.bridge
      );

      const response = await transferTokenToOP(
        amountTokens,
        selectedToken.bridge
      );

      if (response.receipt) {
        setSteps("step2");

        try {
          setSteps("step3");
          await switchNetwork(11155420);
          try {
            const responseMint = await mintOpToken(
              amountTokens,
              selectedToken.bridgeOP,
              response.nonce,
              address
            );
            toast.success("Transaction completed");
            setSteps("step4");
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          setSteps("step1");
          setOpen(false);
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  let modalContent;

  if (steps === "step1") {
    modalContent = (
      <div className="flex flex-col">
        <h1 className="text-2xl mt-5">Awaiting confirmation</h1>
        <p className="mt-5">please confirm the transaction</p>
        <h2 className="text-xl mt-5">
          Step 1 - burning token on ethereum mainnet network
        </h2>
        <div className="flex justify-center mt-10">
          <Oval
            visible={true}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            color={"#840c4a"}
          />
        </div>
      </div>
    );
  }

  if (steps === "step2") {
    modalContent = (
      <div className="flex flex-col">
        <h1 className="text-2xl mt-5">Awaiting confirmation</h1>
        <p className="mt-5">please confirm the network change</p>
        <h2 className="text-xl mt-5">Step 2 - changing network</h2>
        <div className="flex justify-center mt-10">
          <Oval
            visible={true}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            color={"#840c4a"}
          />
        </div>
      </div>
    );
  }

  if (steps === "step3") {
    modalContent = (
      <div className="flex flex-col">
        <h1 className="text-2xl mt-5">Awaiting confirmation</h1>
        <p className="mt-5">please confirm the transaction</p>
        <h2 className="text-xl mt-5">
          Step 3 - minting token on optimism mainnet network
        </h2>
        <div className="flex justify-center mt-10">
          <Oval
            visible={true}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            color={"#840c4a"}
          />
        </div>
      </div>
    );
  }

  if (steps === "step4") {
    modalContent = (
      <div className="flex flex-col">
        <h1 className="text-2xl mt-5">Success</h1>
        <p className="mt-5">Your tokens are ready on the optimism network</p>
      </div>
    );
  }

  return (
    <>
      <Modal open={open} className="p-4 ">
        {modalContent}
      </Modal>
      <div className="p-4 translate-y-20 rounded-3xl w-full max-w-[500px] bg-zinc-900 mt-20">
        <NavItems />

        <div className="flex items-center justify-between px-1 my-4">
          <p>Bridge</p>
          <CogIcon className="h-6" />
        </div>

        <div className="flex justify-center items-center">
          <div className="gap-2 flex items-center w-1/2 bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600">
            <Image
              src={selectedToken.image}
              alt={selectedToken.name}
              width={30}
              height={30}
              className="left-3 top-1/2 transform"
            />
            <select
              className="w-full bg-transparent appearance-none"
              onChange={handleTokenChange}
              value={selectedToken.name}
            >
              {tokens.map((token) => (
                <option
                  data-key={token.address}
                  key={token.address}
                  value={token.name}
                  className="p-2"
                >
                  {token.name}
                </option>
              ))}
            </select>
          </div>

          <ArrowSmRightIcon className="justify-center h-10 p-1 bg-[#212429] border-4 border-zinc-900 text-zinc-300 rounded-xl cursor-pointer hover:scale-110" />

          <div className="flex gap-2 w-1/2 bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600">
            <Image
              src="/tokens/optimism.svg"
              alt="OP Mainnet"
              width={30}
              height={30}
              className="left-3 top-1/2 transform"
            />
            <select className="w-full bg-transparent appearance-none">
              <option value="OP Mainnet" className="p-2">
                OP Mainnet
              </option>
            </select>
          </div>
        </div>

        <div className="items-center rounded-xl relative">
          <div className="bg-[#212429] p-4 py-4 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600">
            <div
              className={`absolute text-xs mx-2 text-white pointer-events-none shadow-lg bottom-[.2rem] `}
            >
              {"Avaliable: " + balance}
            </div>
            <input
              className="w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent"
              type="number"
              placeholder="0"
              onChange={handleAmountChange}
              value={amountTokens}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="p-4 w-full my-4 rounded-xl bg-[#840c4a]"
          onClick={() => {
            if (!address) openConnectModal();
            else requestBridge();
          }}
        >
          {!address ? CONNECT_WALLET : CONFIRM}
        </button>
      </div>
    </>
  );
};

export default Bridge;
