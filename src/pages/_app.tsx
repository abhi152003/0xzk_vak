import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "../../wagmi.config";

import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState<boolean>(false);
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false);

  useEffect(() => {
    setReady(true);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      {ready ? (
        <WagmiProvider config={config}>
          <RainbowKitProvider
            theme={darkTheme()}
            modalSize="compact"
          >
            <AnonAadhaarProvider
              _useTestAadhaar={useTestAadhaar}
              _appName="Anon Aadhaar"
            >
              <Component
                {...pageProps}
                setUseTestAadhaar={setUseTestAadhaar}
                useTestAadhaar={useTestAadhaar}
              />
            </AnonAadhaarProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      ) : null}
    </QueryClientProvider>
  );
}
