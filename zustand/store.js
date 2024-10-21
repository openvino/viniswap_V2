import { create } from "zustand";

const useWeb3Store = create((set) => ({
	provider: null,
	activeAccount: null,
	signer: null,
	transactionMessage: "",
	setProvider: (provider) => set({ provider }),
	setProviderLegacy: (providerLegacy) => set({ providerLegacy }),
	setActiveAccount: (activeAccount) => set({ activeAccount }),
	setSigner: (signer) => set({ signer }),
	setSignerLegacy: (signerLegacy) => set({ signerLegacy }),
	setTransactionMessage: (transactionMessage) => set({ transactionMessage }),
}));

export default useWeb3Store;
