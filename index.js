const Moralis = require("moralis/node");
const Analytics = require("analytics-node");
const mysql = require('mysql2/promise');
const axios = require('axios');

// Old Code

// Connect to Segment Analytics
const analytics = new Analytics(process.env.analytics_key);

// Secure connection to database
const pool = mysql.createPool({
  host: process.env.db_host,
  user: process.env.db_user,
  port: process.env.db_port,
  password: process.env.db_secret,
  database: process.env.db_name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.handler = async (event) => {

  // Moralis API Initialization
  const serverUrl = process.env.moralis_server;
  const appId = process.env.moralis_appid;
  const moralisSecret = process.env.moralis_secret;
  await Moralis.start({ serverUrl, appId, moralisSecret });

  // User Address Parameter
  const address = event["params"]["querystring"]["address"];

  // Collection Address Parameter
  const nftAddress = event["params"]["querystring"]["nftAddress"];

  // Chain Parameter
  const chain = event["params"]["querystring"]["chain"];


  // Initialization Analytics
  analytics.track({
    userId: address,
    event: "Token Gate Used",
    properties: {
      chain: chain,
      nftAddress: nftAddress,
    },
  });

  // Status Analytics
  const sendAnalytics = (status) => {
    analytics.track({
      userId: address,
      event: status,
      properties: {
        userAddress: address,
        nftAddress: nftAddress,
        nftChain: chain,
      },
    });
  }

  // Subscription Check
  const result = await pool.query('SELECT * FROM whitelist WHERE address = ?', [nftAddress]);
  if (result[0].length < 1) {
    sendAnalytics("Token Gate Failed: Bad Whitelist");
    return {
      status: "Error",
      data: {
        "userAddress": address,
        "nftAddress": nftAddress,
        "nftChain": chain,
        "tokenGate": false,
        "message": "Token Address not Whitelisted!"
      }
    };
  }

  ///////////////////////////////////
  // TOKEN GATING CODE STARTS HERE //

  // Solana Token Gating (Does not work yet)
  if (chain === "solana") {
    const options = {
      chain: "mainnet",
      address: address,
    };
    const nftBalance = await Moralis.SolanaAPI.account.getNFTs(options);
    return nftBalance;

    // OpenSea Token Gate
  } else if (chain === "opensea") {
    // nftAddress = Collection Slug
    // Only if chain = opensea



    try {
      let res = await axios.get(
        `https://api.opensea.io/api/v1/assets?owner=${address}&collection=${nftAddress}`,
        {
          headers: {
            "X-API-KEY": process.env.XAPIKEY,
          },
        }
      );
      if (res.data.assets.length < 1) {
        sendAnalytics("Token Gate Failed: Not Owner");
        return false;
      } else {
        sendAnalytics("Token Gate Success");
        return true;
      }
    } catch (e) {
      return (e);
    }


    // Ethereum Token Gate
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
      sendAnalytics("Token Gate Success");
      return true;
    } else {
      sendAnalytics("Token Gate Failed: Not Owner");
      return false;
    }
  }

  // TOKEN GATING CODE ENDS HERE //
  /////////////////////////////////
};
