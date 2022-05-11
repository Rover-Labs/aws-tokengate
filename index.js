const Moralis = require("moralis/node");
const Analytics = require("analytics-node");
const mysql = require('mysql2/promise');
const axios = require('axios');

// Connect to Segment Analytics
const analytics = new Analytics("DAsmuBOK66rejbtN9vCfHW3zFs7rA3yj");

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
    var config = {
      method: 'get',
      url: 'https://api.opensea.io/api/v1/assets?owner=0x2769B116e44fB9eA698ea3B026B91C5103C37E80&collection=cryptdogenft',
      headers: {
        'X-API-KEY': '8bc7b3287763474fbe9d296f896e0856',
        'Cookie': '__cf_bm=C3GdLIBwl3WGlgIL7oaH0OudDqPsGGSqT33PxkablKE-1652238806-0-AdCjgtiaizmnXbRiELmaeFrfY9uO2ZDShsBCKQSOQ2qDt44iC1K6eg8Cq+BB6g2oAM/iOeH2KKqIhMTvkvJPq8M='
      }
    };

    axios(config)
      .then(function (response) {
        return(JSON.stringify(response.data));
      })
      .catch(function (error) {
        return(error);
      });


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
      return {
        status: "Success",
        data: {
          "userAddress": address,
          "nftAddress": nftAddress,
          "nftChain": chain,
          "tokenGate": true,
          "message": "Token Gate Successful!"
        }
      };
    } else {
      sendAnalytics("Token Gate Failed: Not Owner");
      return {
        status: "Error",
        data: {
          "userAddress": address,
          "nftAddress": nftAddress,
          "nftChain": chain,
          "tokenGate": false,
          "message": "User does not own token!"
        }
      };
    }
  }

  // TOKEN GATING CODE ENDS HERE //
  /////////////////////////////////
};
