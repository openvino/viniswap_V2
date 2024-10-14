export const MTB24 = "MTB24";
export const WETH = "ETH";
export const TT0 = "TT0";
export const DEFAULT_VALUE = "Select a token";
// export const DEFAULT_VALUE = { name: "Select a token", address: "" };

export const coinAddresses = [
  {
    name: WETH,
    address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
  },
  {
    name: MTB24,
    address: process.env.NEXT_PUBLIC_MTB24_ADDRESS,
  },
  {
    name: TT0,
    address: "0xc53c298c1f2e85579d4fDf7aFaC2b9429e9DdE58",
  },
];

export const getCoinAddress = (name) => {
  const coin = coinAddresses.find((coin) => coin.name === name);
  return coin?.address || "";
};
export const getCoinName = (address) => {
  const coin = coinAddresses.find((coin) => coin.address === address);
  return coin?.name || "";
};
