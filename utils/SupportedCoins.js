export const MTB24 = "MTB24";
export const WETH = "ETH";
export const TT0 = "TT0";
export const DEFAULT_VALUE = "Select a token";
// export const DEFAULT_VALUE = { name: "Select a token", address: "" };

export const coinAddresses = [
	//BASE
	{
		name: WETH,
		address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
	},
	{
		name: "MTB18",
		address: "0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23",
	},
	{
		name: "MTB19",
		address: "0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF",
	},
	{
		name: "MTB20",
		address: "0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F",
	},
	{
		name: "MTB21",
		address: "0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f",
	},
	{
		name: "MTB22",
		address: "0xeF89072a1f25c2aDA952c2e04644289906e0e6F9",
	},
	{
		name: "MTB23",
		address: "0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820",
	},
	{
		name: "MTB24",
		address: "0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe",
	},

	//BASE SEPOLIA
	// {
	// 	name: WETH,
	// 	address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
	// },
	// {
	// 	name: "MTB18",
	// 	address: "0x74C143a1AD7AE158F5e09db0ff3B370B1D825EC6",
	// },
	// {
	// 	name: "MTB19",
	// 	address: "0xf38b649C87b42403BdABc2a850B691f10fe8193d",
	// },
	// {
	// 	name: "MTB20",
	// 	address: "0x90c112D4A62bFb988b935B24DED530Da6A03492E",
	// },
	// {
	// 	name: "MTB21",
	// 	address: "0x06270bE94A94621efd724E2d4D5a19B19e2dD506",
	// },
	// {
	// 	name: "MTB22",
	// 	address: "0xDF90e7FCE96146DeEe8a55156222BD4fca855cF7",
	// },
	// {
	// 	name: "MTB23",
	// 	address: "0x5Fd0271DC1fd50879a642FA6f294C92e3F18Cd7D",
	// },
	//
	// OP SEPOLIA
	// {
	// 	name: WETH,
	// 	address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
	// },
	// {
	// 	name: MTB24,
	// 	address: process.env.NEXT_PUBLIC_MTB24_ADDRESS,
	// },
	// {
	// 	name: TT0,
	// 	address: "0xc53c298c1f2e85579d4fDf7aFaC2b9429e9DdE58",
	// },
];
console.log("supported coins", coinAddresses);

export const getCoinAddress = (name) => {
	const coin = coinAddresses.find((coin) => coin.name === name);
	return coin?.address || "";
};
export const getCoinName = (address) => {
	const coin = coinAddresses.find((coin) => coin.address === address);
	return coin?.name || "";
};
