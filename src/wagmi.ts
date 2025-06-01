import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { celo, base } from "wagmi/chains";

export const config = createConfig({
  chains: [celo],
  connectors: [farcasterFrame()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
