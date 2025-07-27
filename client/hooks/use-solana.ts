import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export const useSolana = () => {
  const { connection } = useConnection();
  const { 
    publicKey, 
    wallet, 
    connected, 
    connecting, 
    disconnecting,
    connect,
    disconnect,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage
  } = useWallet();

  // Helper functions
  const getBalance = async (publicKey?: any) => {
    if (!publicKey || !connection) return null;
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / 1000000000; // Convert lamports to SOL
    } catch (error) {
      console.error("Failed to get balance:", error);
      return null;
    }
  };

  const airdrop = async (publicKey?: any, amount = 1) => {
    if (!publicKey || !connection) return null;
    try {
      const signature = await connection.requestAirdrop(publicKey, amount * 1000000000);
      await connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error("Airdrop failed:", error);
      return null;
    }
  };

  return {
    // Connection
    connection,
    
    // Wallet state
    publicKey,
    wallet,
    connected,
    connecting,
    disconnecting,
    
    // Wallet actions
    connect,
    disconnect,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage,
    
    // Helper functions
    getBalance: (pk = publicKey) => getBalance(pk),
    airdrop: (pk = publicKey, amount = 1) => airdrop(pk, amount),
  };
};
