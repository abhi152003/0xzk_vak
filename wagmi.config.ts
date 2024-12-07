import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, mainnet, polygonZkEvmCardona, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AadharDomain',
  projectId: process.env.NEXT_PUBLIC_APP_ID || '', // Get from WalletConnect Cloud
  chains: [mainnet, sepolia, base, baseSepolia],
  ssr: true, // Enable server-side rendering
});