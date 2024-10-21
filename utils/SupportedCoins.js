export const MTB18 = "MTB18";
export const MTB19 = "MTB19";
export const MTB20 = "MTB20";
export const MTB21 = "MTB21";
export const MTB22 = "MTB22";
export const MTB23 = "MTB23";
export const MTB24 = "MTB24";
export const WETH = "ETH";
export const TT0 = "TT0";
export const DEFAULT_VALUE = "Select a token";
// export const DEFAULT_VALUE = { name: "Select a token", address: "" };

// op sepolia
// export const coinAddresses = [
//   {
//     name: WETH,
//     address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
//   },
//   {
//     name: MTB24,
//     address: process.env.NEXT_PUBLIC_MTB24_ADDRESS,
//   },
//   {
//     name: TT0,
//     address: "0xc53c298c1f2e85579d4fDf7aFaC2b9429e9DdE58",
//   },
// ];

//Base Sepolia
export const coinAddresses = [
	{
		name: WETH,
		address: "0x4200000000000000000000000000000000000006",
	},
	// {
	// 	name: MTB18,
	// 	address: "0x238B9E331AC2E2671469e2212978a858E83d85D3",
	// },
	{
		name: MTB19,
		address: "0x08510f0bD94E437c06695E4F85c2c34245122Ef8",
	},
	// {
	// 	name: MTB20,
	// 	address: "0xCC44D7A86dd5870D92ddB45Bd78aB99dA571039C",
	// },
	// {
	// 	name: MTB21,
	// 	address: "0x542319C5a0a8C43910551b17078d7bdB34AA40e9",
	// },
	// {
	// 	name: MTB22,
	// 	address: "0x484932767Af93336fE659dd9A51569280F81e10f",
	// },
	// {
	// 	name: MTB23,
	// 	address: "0x96D9E67C455420FAFDBe8CffAcED54a226828Ff7",
	// },
];

export const getCoinAddress = (name) => {
	const coin = coinAddresses.find((coin) => coin.name === name);
	return coin?.address || "";
};
export const getCoinName = (address) => {
	const coin = coinAddresses.find((coin) => coin.address === address);
	return coin?.name || "";
};
