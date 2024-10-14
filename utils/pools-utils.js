import { lpTokenBalance, tokenBalance, wethBalance } from "./queries";
import { whitelistedPools } from "./whitelistedPools";

export const pairIsWhitelisted = (address0, address1) => {
  const pair = [address0, address1];

  const isWhitelisted = whitelistedPools.find(
    (pool) =>
      (pool.pair[0] === address0 && pool.pair[1] === address1) ||
      (pool.pair[0] === address1 && pool.pair[1] === address0)
  );

  return !!isWhitelisted;
};

export const getBalances = (srcToken, destToken, reserves) => {
  const srcBalancePromise =
    srcToken.name === "ETH" ? wethBalance() : tokenBalance(srcToken.address);
  const destBalancePromise =
    destToken.name === "ETH" ? wethBalance() : tokenBalance(destToken.address);
  const lpBalancePromise = lpTokenBalance(reserves.address);

  return Promise.all([srcBalancePromise, destBalancePromise, lpBalancePromise])
    .then(([srcBalance, destBalance, lpBalance]) => {
      console.log("Source Token Balance:", srcBalance);
      console.log("Destination Token Balance:", destBalance);
      console.log("LP Token Balance:", lpBalance);

      return {
        srcBalance,
        destBalance,
        lpBalance,
      };
    })
    .catch((error) => {
      console.error("Failed to get balances:", error);
      throw error;
    });
};
