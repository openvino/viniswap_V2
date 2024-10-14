import { mtbContracts } from "../utils/contract";
import { toEth } from "../utils/ether-utils";
import { useState, useEffect } from "react";

const useBridge = (tokenAddress, account) => {
  const { chain } = useNetwork();
  const [balance, setBalance] = useState(0);
  const { address } = useAccount();

  useEffect(() => {
    const fetchBalance = async () => {
      const tokenContractObj = await mtbContracts(tokenAddress);
      const getBalance = await tokenContractObj.balanceOf(account);
      setBalance(toEth(getBalance).toString().split(".")[0]);
    };
    if (address && chain?.id === 11155111) {
      fetchBalance();
    }
  }, [tokenAddress, address, chain]);
  return {
    balance,
  };
};

export default useBridge;
