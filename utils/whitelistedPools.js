// TODO fetch whitelisted pools from db

export const whitelistedPools = [
  // {
  //   // OP
  //   address: "0x5F518BD5abBE87D7ace08c5976003bd763089F98",

  //   pair: [
  //     "0x1159862C5D48f8f970942FCf86e664680438d13A",
  //     "0x4200000000000000000000000000000000000006",
  //   ],
  // },
  {
    //
    address: "0x21C281897F533fDc9A26BC201002e1c60c5D2033",

    pair: [
      "0xA68cf859Ef68ba6ab808550B48427FC885954dd8",
      "0x74A4A85C611679B73F402B36c0F84A7D2CcdFDa3",
    ],
  },
];

export const getPairAddress = (pair) => {
  const filteredPair = whitelistedPools.find(
    (p) =>
      (p.pair[0] === pair[0] && p.pair[1] === pair[1]) ||
      (p.pair[0] === pair[1] && p.pair[1] === pair[0])
  );

  return filteredPair?.address || null;
};
