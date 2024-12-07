import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnectButton: React.FC = () => {
  return (
    <ConnectButton 
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
      chainStatus={{
        smallScreen: 'icon',
        largeScreen: 'full',
      }}
    />
  );
};

export default WalletConnectButton;