import { ethers } from "ethers";
import {
  bridgeAbi,
  factoryABI,
  mtb24ABI,
  pairABI,
  routerABI,
  wethABI,
} from "./abi";
import useWeb3Store from "../zustand/store";

export const mtb24Contract = async (address) => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  if (activeAccount) {
    console.log(
      provider,
      "provider",
      activeAccount,
      "activeAccount",
      signer,
      "signer"
    );
    const contractReader = new ethers.Contract(address, mtb24ABI, signer);
    return contractReader;
  }
};

// export const mtb24Contract = async (address) => {
//   if (typeof window !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const { ethereum } = window;
//     if (ethereum) {
//       const signer = provider.getSigner();
//       const contractReader = new ethers.Contract(address, mtb24ABI, signer);
//       return contractReader;
//     }
//   }
// };

export const wethContract = async () => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  console.log(
    provider,
    "provider",
    activeAccount,
    "activeAccount",
    signer,
    "signer"
  );
  if (activeAccount) {
    const routerObj = await routerContract();

    const contractReader = new ethers.Contract(
      process.env.NEXT_PUBLIC_WETH_ADDRESS,
      wethABI,
      signer
    );
    return contractReader;
  }
};

// export const wethContract = async () => {
//   if (typeof window !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const { ethereum } = window;

//     if (ethereum) {
//       const routerObj = await routerContract();
//       const signer = provider.getSigner();
//       const contractReader = new ethers.Contract(
//         process.env.NEXT_PUBLIC_WETH_ADDRESS,
//         wethABI,
//         signer
//       );
//       return contractReader;
//     }
//   }
// };

export const routerContract = async () => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  if (activeAccount) {
    const contractReader = new ethers.Contract(
      process.env.NEXT_PUBLIC_ROUTER,
      routerABI,
      signer
    );

    return contractReader;
  } else {
    console.error("Wallet is not available in the current environment.");
  }
};
// export const routerContract = async () => {
//   if (typeof window !== "undefined") {
//     const { ethereum } = window;

//     if (ethereum) {
//       try {
//         await ethereum.request({ method: "eth_requestAccounts" });

//         const provider = new ethers.providers.Web3Provider(ethereum);
//         const signer = provider.getSigner();
//         const contractReader = new ethers.Contract(
//           process.env.NEXT_PUBLIC_ROUTER,
//           routerABI,
//           signer
//         );

//         return contractReader;
//       } catch (error) {
//         console.error("Need account access", error);
//       }
//     } else {
//       console.error(
//         "Wallet is not installed or not available in the current environment."
//       );
//     }
//   } else {
//     console.error("You must run this in a browser.");
//   }
// };

export const factoryContract = async () => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  console.log(
    provider,
    "provider",
    activeAccount,
    "activeAccount",
    signer,
    "signer"
  );
  if (activeAccount) {
    const router = await routerContract();
    const factoryAddress = await router.factory();
    return new ethers.Contract(factoryAddress, factoryABI, signer);
  } else {
    throw new Error("Ethereum object not found.");
  }
};

export const pairContract = async (pairAddress) => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;

  if (activeAccount) {
    try {
      return new ethers.Contract(pairAddress, pairABI, signer);
    } catch (error) {
      console.error("Failed to get pair contract:", error);
      throw error;
    }
  }
};

export const mtbContracts = async (address) => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  console.log(
    provider,
    "provider",
    activeAccount,
    "activeAccount",
    signer,
    "signer"
  );
  if (activeAccount) {
    const contractReader = new ethers.Contract(address, mtb24ABI, signer);
    return contractReader;
  }
};

export const bridgeContract = async (address) => {
  const provider = useWeb3Store.getState().provider;
  const activeAccount = useWeb3Store.getState().activeAccount;
  const signer = useWeb3Store.getState().signer;
  if (activeAccount) {
    const contractReader = new ethers.Contract(address, bridgeAbi, signer);
    return contractReader;
  }
};

// import { ethers } from "ethers";
// import {
//   bridgeAbi,
//   factoryABI,
//   mtb24ABI,
//   pairABI,
//   routerABI,
//   wethABI,
// } from "./abi";

// const INFURA_PROJECT_ID = "ce8d632a5fdf485ea8e0f041b48c3f69";

// export const getProvider = () => {
//   if (typeof window !== "undefined" && window.ethereum) {
//     return new ethers.providers.Web3Provider(window.ethereum);
//   } else {
//     return new ethers.providers.JsonRpcProvider(
//       `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
//     );
//     // return new ethers.providers.JsonRpcProvider(
//     //   `https://optimism-sepolia.mainnet.io/v3/${INFURA_PROJECT_ID}`
//     // );
//   }
// };

// // export const getSignerOrProvider = async (provider) => {
// //   if (provider.getSigner && window?.ethereum) {
// //     try {
// //       const accounts = await window.ethereum.request({
// //         method: "eth_accounts",
// //       });
// //       if (accounts.length === 0) {
// //         return new ethers.providers.JsonRpcProvider(
// //           `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
// //         );
// //         // return new ethers.providers.JsonRpcProvider(
// //         //   `https://optimism-sepolia.mainnet.io/v3/${INFURA_PROJECT_ID}`
// //         // );
// //       } else {
// //         return provider.getSigner();
// //       }
// //     } catch (error) {
// //       console.error(
// //         "Error while trying to get signer or connect to RPC provider",
// //         error
// //       );
// //       throw new Error("Error processing the request.");
// //     }
// //   }
// //   return provider;
// // };

// export const mtb24Contract = async (address) => {
//   const provider = getProvider();
//   console.log(provider, "provider");

//   // const signerOrProvider = await getSignerOrProvider(provider);
//   return new ethers.Contract(address, mtb24ABI, provider);
// };

// export const wethContract = async () => {
//   const provider = getProvider();

//   return new ethers.Contract(
//     process.env.NEXT_PUBLIC_WETH_ADDRESS,
//     wethABI,
//     provider
//   );
// };

// export const routerContract = async () => {
//   const provider = getProvider();

//   return new ethers.Contract(
//     process.env.NEXT_PUBLIC_ROUTER,
//     routerABI,
//     provider
//   );
// };

// export const factoryContract = async () => {
//   const provider = getProvider();

//   const router = await routerContract();
//   const factoryAddress = await router.factory();
//   return new ethers.Contract(factoryAddress, factoryABI, provider);
// };

// export const pairContract = async (pairAddress) => {
//   const provider = getProvider();

//   return new ethers.Contract(pairAddress, pairABI, provider);
// };

// export const mtbContracts = async (address) => {
//   const provider = getProvider();
//   const signerOrProvider = await getSignerOrProvider(provider);
//   return new ethers.Contract(address, mtb24ABI, provider);
// };

// export const bridgeContract = async (address) => {
//   const provider = getProvider();

//   return new ethers.Contract(address, bridgeAbi, provider);
// };
