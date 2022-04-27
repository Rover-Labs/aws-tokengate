const Moralis = require("moralis/node");

exports.handler = async (event) => {
  const address = event["params"]["querystring"]["address"];
  const nftAddress = event["params"]["querystring"]["nftAddress"];
  const chain = event["params"]["querystring"]["chain"];
  const serverUrl = "https://ckb11ejzq8dp.grandmoralis.com:2053/server";
  const appId = "lDDXYagREnknCf9WxDm994rB9YcHiEfk767ehbna";
  const moralisSecret =
    "1gSzI1YNfLvgwZjTD2l9y6nq6elWKwtUinHBKGuhTLDU1NoKbASJu1dFpOeSjnJp";
  await Moralis.start({ serverUrl, appId, moralisSecret });

  if (chain === "solana") {
    const options = {
      chain: "mainnet",
      address: address,
    };
    const nftBalance = await Moralis.SolanaAPI.account.getNFTs(options);
    return nftBalance;
  } else {
    const options = {
      chain: chain,
      address: address,
      token_address: nftAddress,
    };
    const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(
      options
    );
    if (polygonNFTs.total >= 1) {
      return true;
    } else {
      return false;
    }
  }
};
