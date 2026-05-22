import { ethers } from "ethers";

export const toWei = (amount, decimals = 18) => {
  const truncatedAmount = parseFloat(amount).toFixed(18);
  const toWei = ethers.utils.parseUnits(truncatedAmount, decimals);
  return toWei.toString();
};

export const toEth = (amount, decimals = 18) => {
  const toEth = ethers.utils.formatUnits(amount, decimals);
  return toEth.toString();
};
