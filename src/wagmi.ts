import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { celo, base } from "wagmi/chains";

export const config = createConfig({
  chains: [celo, base],
  connectors: [farcasterFrame()],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
