// TODO fetch whitelisted pools from db
const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS;
export const whitelistedPools = [
	// BASE SEPOLIA

	{
		address: "0xC398f3a4faa77934035aad0a7d9c612f7169e31C",
		pair: ["0x74C143a1AD7AE158F5e09db0ff3B370B1D825EC6", WETH_ADDRESS],
	},
	{
		address: "0x7DCE1f1640E26FDeCf48f2c6E8177689eb3cb2E7",
		pair: ["0xf38b649C87b42403BdABc2a850B691f10fe8193d", WETH_ADDRESS],
	},
	{
		address: "0xFD6fC6BBd7a26d5fc9231D3E8f57DCf08f003489",
		pair: ["0x90c112D4A62bFb988b935B24DED530Da6A03492E", WETH_ADDRESS],
	},
	// {
	// 	address: "0x06270bE94A94621efd724E2d4D5a19B19e2dD506",
	// },
	// {
	// 	address: "0xDF90e7FCE96146DeEe8a55156222BD4fca855cF7",
	// },
	// {
	// 	address: "0x5Fd0271DC1fd50879a642FA6f294C92e3F18Cd7D",
	// },

	// {
	//   // OP
	//   address: "0x5F518BD5abBE87D7ace08c5976003bd763089F98",

	//   pair: [
	//     "0x1159862C5D48f8f970942FCf86e664680438d13A",
	//     "0x4200000000000000000000000000000000000006",
	//   ],
	// },

	// OP SEPOLIA
	// {
	// 	//
	// 	address: "0x21C281897F533fDc9A26BC201002e1c60c5D2033",

	// 	pair: [
	// 		"0xA68cf859Ef68ba6ab808550B48427FC885954dd8",
	// 		"0x74A4A85C611679B73F402B36c0F84A7D2CcdFDa3",
	// 	],
	// },
];

export const getPairAddress = (pair) => {
	const filteredPair = whitelistedPools.find(
		(p) =>
			(p.pair[0] === pair[0] && p.pair[1] === pair[1]) ||
			(p.pair[0] === pair[1] && p.pair[1] === pair[0])
	);

	return filteredPair?.address || null;
};
