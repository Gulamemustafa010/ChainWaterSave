"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";

const inter = Inter({ subsets: ["latin"] });

const initialMockChains: Readonly<Record<number, string>> = {
  31337: "http://localhost:8545",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>ChainWaterSave - Water Saving Action Log</title>
        <meta name="description" content="Privacy-preserving water saving DApp based on FHEVM" />
      </head>
      <body className={inter.className}>
        <MetaMaskProvider>
          <MetaMaskEthersSignerProvider initialMockChains={initialMockChains}>
            <InMemoryStorageProvider>
              {children}
            </InMemoryStorageProvider>
          </MetaMaskEthersSignerProvider>
        </MetaMaskProvider>
      </body>
    </html>
  );
}
