import { create } from "zustand";

const useWeb3Store = create((set) => ({
	provider: null,
	activeAccount: null,
	signer: null,
	transactionMessage: "",
	isHuman: false,

	setProvider: (provider) => set({ provider }),
	setActiveAccount: (activeAccount) => set({ activeAccount }),
	setSigner: (signer) => set({ signer }),
	setTransactionMessage: (transactionMessage) => set({ transactionMessage }),
	setIsHuman: (isHuman) => set({ isHuman }),
}));

export default useWeb3Store;
