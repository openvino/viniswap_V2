// TODO fetch whitelisted pools from db
const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS;
export const whitelistedPools = [
	// BASE SEPOLIA

	//MTB18
	{
		address: "0xdDeC9C61cC526e79fb686d12be00577853E358Be",
		pair: ["0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23", WETH_ADDRESS],
	},
	//MTB19
	{
		address: "0x07aA6e8fef4A368D111040B2bF5dD570b75a2781",
		pair: ["0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF", WETH_ADDRESS],
	},
	//MTB20
	{
		address: "0xe497383530ffDD92c1caF7a6072C384E0131D7ef",
		pair: ["0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F", WETH_ADDRESS],
	},
	//MTB21
	{
		address: "0x4c2871bc115c01Fb05EE95d377EA67F159f148Fa",
		pair: ["0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f", WETH_ADDRESS],
	},
	//MTB22
	{
		address: "0x6Ed45D02A70C116b6aE9f0A928474D4c41B1AFb7",
		pair: ["0xeF89072a1f25c2aDA952c2e04644289906e0e6F9", WETH_ADDRESS],
	},
	//MTB23
	{
		address: "0xAc826B4901F92e910EA829D64A49BB624A41c548",
		pair: ["0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820", WETH_ADDRESS],
	},
	//MTB24
	{
		address: "0xf8f0d8F21Be23E97cE7524656Cb6326e5582609A",
		pair: ["0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe", WETH_ADDRESS],
	},

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
