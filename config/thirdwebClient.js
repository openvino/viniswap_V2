import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { crowdsaleOviABI } from "../utils/crowdsaleOvi";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
export const chain = base;


export const client = createThirdwebClient({
	clientId: clientId,
});

// export const accountAbstraction = {
// 	chain,
// 	factoryAddress: process.env.NEXT_PUBLIC_ACCOUNT_FACTORY,
// 	sponsorGas: true,
// }

export const thirdwebRouterContract = getContract({
	address: process.env.NEXT_PUBLIC_ROUTER,
	chain,
	client,
});

export const thirdwebWethContract = getContract({
	address: process.env.NEXT_PUBLIC_WETH_ADDRESS,
	chain,
	client,
});

export const crowdsaleOvi = getContract({
	address: '0x1A41a301CA7Aa3d69d1cb1dD2Ff46Fc7094AF01A',
	chain: baseSepolia,
	abi:crowdsaleOviABI,
	client,
})
