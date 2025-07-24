// src/hooks/useWallet.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

export const useSolanaWallet = () => {
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    connect,
    disconnect,
    wallets,
    wallet,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
  } = useWallet();

  const walletAddress = useMemo(() => publicKey?.toBase58() ?? '', [publicKey]);

  return {
    wallet, // currently selected wallet adapter (e.g., Phantom)
    wallets, // list of available wallet adapters
    publicKey,
    walletAddress,
    connected,
    connecting,
    disconnecting,
    connectWallet: connect,
    disconnectWallet: disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
  };
};