import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygonZkEvm, polygonZkEvmCardona, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Your App Name',
  projectId: 'faa32d954c31418d4de933e54080513d', // Get from WalletConnect Cloud
  chains: [mainnet, sepolia, polygonZkEvmCardona],
  ssr: true, // Enable server-side rendering
});