import { BigNumber, ethers } from "ethers";

import ethSigUtil from "eth-sig-util";
const EIP712Domain = [
	{ name: "name", type: "string" },
	{ name: "version", type: "string" },
	{ name: "chainId", type: "uint256" },
	{ name: "verifyingContract", type: "address" },
];

const ForwardRequest = [
	{ name: "token", type: "address" },
	{ name: "amount", type: "uint256" },
	{ name: "gas", type: "uint256" },
	{ name: "nonce", type: "uint256" },
	{ name: "data", type: "bytes" },
];

function getMetaTxTypeData(chainId, verifyingContract) {
	return {
		types: {
			EIP712Domain,
			ForwardRequest,
		},
		domain: {
			name: "MinimalForwarder",
			version: "0.0.1",
			chainId,
			verifyingContract,
		},
		primaryType: "ForwardRequest",
	};
}

async function signTypedData(signer, from, data) {
	console.log(data.message);

	const message = JSON.stringify(data.message);
	return await signer.signMessage(message);
}
async function buildRequest(forwarder, input) {
	const nonce = await forwarder
		.getNonce(input.token)
		.then((nonce) => nonce.toString());
	return { value: 0, gas: 1e6, nonce, ...input };
}

async function buildTypedData(forwarder, request) {
	const chainId = await forwarder.provider.getNetwork().then((n) => n.chainId);
	const typeData = getMetaTxTypeData(chainId, forwarder.address);
	return { ...typeData, message: request };
}

export async function signMetaTxRequest(signer, forwarder, input) {
	console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

	console.log(signer, forwarder, input);
	let request;
	let signature;
	try {
		request = await buildRequest(forwarder, input);
		console.log(request);
		const toSign = await buildTypedData(forwarder, request);
		console.log(toSign);
		signature = await signTypedData(signer, input.from, toSign);
		console.log(signature);
	} catch (error) {
		console.log(error);
	}

	return { signature, request };
}
