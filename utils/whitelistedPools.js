// TODO fetch whitelisted pools from db

// op sepolia

// export const whitelistedPools = [
//   // {
//   //
//   //   address: "0x5F518BD5abBE87D7ace08c5976003bd763089F98",

//   //   pair: [
//   //     "0x1159862C5D48f8f970942FCf86e664680438d13A",
//   //     "0x4200000000000000000000000000000000000006",
//   //   ],
//   // },
//   {
//     //
//     address: "0x21C281897F533fDc9A26BC201002e1c60c5D2033",

//     pair: [
//       "0xA68cf859Ef68ba6ab808550B48427FC885954dd8",
//       "0x74A4A85C611679B73F402B36c0F84A7D2CcdFDa3",
//     ],
//   },
// ];

// base sepolia

export const whitelistedPools = [
	// {
	// 	address: "0x476d4C5756d86eD73ae193e4232576235D1110F8",

	// 	pair: [
	// 		"0x238B9E331AC2E2671469e2212978a858E83d85D3",
	// 		"0x4200000000000000000000000000000000000006",
	// 	],
	// },
	{
		address: "0xEAe841D5EfFeD2210e087A7e6F06993fb6fe85d0",

		pair: [
			"0x08510f0bD94E437c06695E4F85c2c34245122Ef8",
			"0x4200000000000000000000000000000000000006",
		],
	},
	// {
	// 	address: "0xC6E6465f62a7F088CA21441F2917Da96EBf1ae5E",

	// 	pair: [
	// 		"0xCC44D7A86dd5870D92ddB45Bd78aB99dA571039C",
	// 		"0x4200000000000000000000000000000000000006",
	// 	],
	// },
	// {
	// 	address: "0xC36A5c04E2504021b31F56436Bd7e4Af9a4312ce",

	// 	pair: [
	// 		"0x542319C5a0a8C43910551b17078d7bdB34AA40e9",
	// 		"0x4200000000000000000000000000000000000006",
	// 	],
	// },
	// {
	// 	address: "0x5C4d0305320FEBc82f9b80A120105ba414F40aC4",

	// 	pair: [
	// 		"0x484932767Af93336fE659dd9A51569280F81e10f",
	// 		"0x4200000000000000000000000000000000000006",
	// 	],
	// },
	// {
	// 	address: "0xA3Ab7e384f8C789A0e9B6EEbF5234064310B1eB7",

	// 	pair: [
	// 		"0x96D9E67C455420FAFDBe8CffAcED54a226828Ff7",
	// 		"0x4200000000000000000000000000000000000006",
	// 	],
	// },
];

export const getPairAddress = (pair) => {
	console.log(pair);

	const filteredPair = whitelistedPools.find(
		(p) =>
			(p.pair[0] === pair[0] && p.pair[1] === pair[1]) ||
			(p.pair[0] === pair[1] && p.pair[1] === pair[0])
	);

	return filteredPair?.address || null;
};
