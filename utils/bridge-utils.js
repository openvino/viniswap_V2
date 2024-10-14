export const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }], // chainId debe estar en formato hexadecimal
      });
    } catch (switchError) {
      // Este bloque maneja los errores, como cuando el usuario no tiene la cadena en su wallet
      if (switchError.code === 4902) {
        try {
          // Aquí podrías agregar la red al wallet si no está presente
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                rpcUrl: 'https://...' // URL del RPC de la cadena
              }
            ]
          });
        } catch (addError) {
          throw addError;
        }
      }
      throw switchError;
    }
  };