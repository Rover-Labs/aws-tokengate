const Moralis = require("moralis/node");
const Analytics = require("analytics-node");
const mysql = require("mysql");

const analytics = new Analytics("DAsmuBOK66rejbtN9vCfHW3zFs7rA3yj");

const db = mysql.createConnection({
  host: "tokengatewhite.cmnoqeobfm8g.us-east-2.rds.amazonaws.com",
  port: "3306",
  user: "Watson",
  password: "rE2Yf7A2l1Y$Dvuw",
  database: "sys",
});

const address = "0xc92ceddfb8dd984a89fb494c376f9a48b999aafc";

db.connect(function(err) {
  if (err) throw err;
  // if connection is successful
  db.query("SELECT * FROM whitelist WHERE address = " + db.escape(address) + "", function (err, result, fields) {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    console.log(result);
    // tests to see if the address is valid other returns invalid subscriber 
    if (result.length === 0) {
      console.log("Invalid subscriber")
    }
    
  });
});
// if else statement with a log of you are not subscribed


//////////////////////////////////////////////////
// exports.handler = async (event) => {

//   // User Address Parameter
//   const address = event["params"]["querystring"]["address"];
//   // Collection Address Parameter
//   const nftAddress = event["params"]["querystring"]["nftAddress"];
//   // Chain Parameter
//   const chain = event["params"]["querystring"]["chain"];

//   // Moralis API Initialization
//   const serverUrl = "https://ckb11ejzq8dp.grandmoralis.com:2053/server";
//   const appId = "lDDXYagREnknCf9WxDm994rB9YcHiEfk767ehbna";
//   const moralisSecret =
//     "1gSzI1YNfLvgwZjTD2l9y6nq6elWKwtUinHBKGuhTLDU1NoKbASJu1dFpOeSjnJp";
//   await Moralis.start({ serverUrl, appId, moralisSecret });

//   analytics.track({
//     userId: address,
//     event: "Token Gate Used",
//     properties: {
//       chain: chain,
//       nftAddress: nftAddress,
//     },
//   });

//   // Solana Token Gating (Does not work yet)
//   if (chain === "solana") {
//     const options = {
//       chain: "mainnet",
//       address: address,
//     };
//     const nftBalance = await Moralis.SolanaAPI.account.getNFTs(options);
//     return nftBalance;

//   // Ethereum Token Gating
//   } else {
//     const options = {
//       chain: chain,
//       address: address,
//       token_address: nftAddress,
//     };
//     const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(
//       options
//     );
//     if (polygonNFTs.total >= 1) {
//       analytics.track({
//         userId: address,
//         event: "Token Gate Success",
//         properties: {
//           chain: chain,
//           nftAddress: nftAddress,
//         },
//       });
//       return true;
//     } else {
//       analytics.track({
//         userId: address,
//         event: "Token Gate Failed",
//         properties: {
//           chain: chain,
//           nftAddress: nftAddress,
//         },
//       });
//       return false;
//     }
//   }
// };
