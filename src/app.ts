import '@polkadot/api-augment/substrate'
import { ApiPromise, WsProvider } from "@polkadot/api";

const { GATEWAY_URL } = process.env;

const appchainEndpoint = GATEWAY_URL;
console.log("appchainEndpoint", appchainEndpoint);

if (!appchainEndpoint) {
  console.error("GATEWAY_URL required!!!!")
  process.exit(-1);
}

async function init() {
  const wsProvider = new WsProvider(appchainEndpoint);
  const appchain = await ApiPromise.create({
    provider: wsProvider,
  });
  wsProvider.on("error", (error: any) =>
    console.log("provider", "error", JSON.stringify(error))
  );
  appchain.on("disconnected", () => {
    console.log("provider.isConnected", wsProvider.isConnected);
    console.log("appchain.isConnected", appchain.isConnected);
  });
  appchain.on("connected", () => {
    console.log("provider.isConnected", wsProvider.isConnected);
    console.log("appchain.isConnected", appchain.isConnected);
  });
  appchain.on("error", (error) =>
    console.log("api", "error", JSON.stringify(error))
  );
  return appchain;
}


let latestFinalizedHeight = 0;
async function subscribeFinalizedHeights(appchain: ApiPromise) {
  console.log("subscribeFinalizedHeights");
  return await appchain.rpc.chain.subscribeFinalizedHeads(async (header: any) => {
    latestFinalizedHeight = header.number.toNumber();
  });
}

let lastLogHeight: null | number = null;
async function start() {
  const api = await init();
  const unsub = subscribeFinalizedHeights(api);
  console.log("unsub", unsub);
  setInterval(async () => {
    if (lastLogHeight === latestFinalizedHeight) {
      console.error(new Date().toLocaleString('cn-Zh', { timeZone: 'Asia/Shanghai', timeZoneName: 'short' }), "height no change!", lastLogHeight);
    } else {
      lastLogHeight = latestFinalizedHeight;
      console.log(new Date().toLocaleString('cn-Zh', { timeZone: 'Asia/Shanghai', timeZoneName: 'short' }), "latestFinalizedHeight", latestFinalizedHeight);
      const lastBlockHash = await (await api.rpc.chain.getBlockHash(latestFinalizedHeight)).toString();
      console.log("lastBlockHash", lastBlockHash);
    }
  }, 5 * 60 * 1000);
}


start();
