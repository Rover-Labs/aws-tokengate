const Moralis = require("moralis/node");
const Analytics = require("analytics-node");
const mysql = require('mysql2/promise');

const analytics = new Analytics("DAsmuBOK66rejbtN9vCfHW3zFs7rA3yj");

const pool = mysql.createPool({
  host: process.env.db_host,
  user: process.env.db_user,
  port: '3306',
  password: process.env.db_secret,
  database: process.env.db_name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.handler = async (event) => {

  // Moralis API Initialization
  const serverUrl = "https://ckb11ejzq8dp.grandmoralis.com:2053/server";
  const appId = "lDDXYagREnknCf9WxDm994rB9YcHiEfk767ehbna";
  const moralisSecret =
    "1gSzI1YNfLvgwZjTD2l9y6nq6elWKwtUinHBKGuhTLDU1NoKbASJu1dFpOeSjnJp";
  await Moralis.start({ serverUrl, appId, moralisSecret });

  // User Address Parameter
  const address = event["params"]["querystring"]["address"];
  // Collection Address Parameter
  const nftAddress = event["params"]["querystring"]["nftAddress"];
  // Chain Parameter
  const chain = event["params"]["querystring"]["chain"];

  analytics.track({
    userId: address,
    event: "Token Gate Used",
    properties: {
      chain: chain,
      nftAddress: nftAddress,
    },
  });

  const result = await pool.query('SELECT * FROM whitelist WHERE address = ?', [nftAddress]);
  if (result[0].length < 1) {
    throw new Error('Address not found');
  }
  // Solana Token Gating (Does not work yet)
  if (chain === "solana") {
    const options = {
      chain: "mainnet",
      address: address,
    };
    const nftBalance = await Moralis.SolanaAPI.account.getNFTs(options);
    return nftBalance;

    // Ethereum Token Gating
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
      analytics.track({
        userId: address,
        event: "Token Gate Success",
        properties: {
          chain: chain,
          nftAddress: nftAddress,
        },
      });
      return true;
    } else {
      analytics.track({
        userId: address,
        event: "Token Gate Failed",
        properties: {
          chain: chain,
          nftAddress: nftAddress,
        },
      });
      return false;
    }
  }
  // return result[0][0];

};
