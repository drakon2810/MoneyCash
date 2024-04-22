const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3005;
const ABI = require("./abi.json");

app.use(cors());
app.use(express.json());

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0,4)}...${transaction[3].slice(0,4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}

  app.get("/getNameAndBalance", async (req, res) => {

    const {userAddress} = req.query;

    const response = await Moralis.EvmApi.utils.runContractFunction({

      chain: "11155111",
      address : "0xf0D5c7bBA23D0c054E782a6CE6f1fB6AaB0090e6",
      functionName: "getMyName",
      abi: ABI,
      params: {_user: userAddress},

    });

    const jsonResponseName = response.raw;

    const setResponse = await Moralis.EvmApi.balance.getNativeBalance({
      chain: "11155111",
      address: userAddress,
    });

    const jsonResponseBal = (setResponse.raw.balance / 1e18).toFixed(2);






    const thirResponse = await Moralis.EvmApi.token.getTokenPrice({
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    
    });

    const jsonResponseDollars = (
      thirResponse.raw.usdPrice * jsonResponseBal
    ).toFixed(2);

    const fourResponse = await Moralis.EvmApi.utils.runContractFunction({

      chain: "11155111",
      address : "0xf0D5c7bBA23D0c054E782a6CE6f1fB6AaB0090e6",
      functionName: "getMyHistory",
      abi: ABI,
      params: {_user: userAddress},

    });

    const fiveResponse = await Moralis.EvmApi.utils.runContractFunction({

      chain: "11155111",
      address : "0xf0D5c7bBA23D0c054E782a6CE6f1fB6AaB0090e6",
      functionName: "getMyRequests",
      abi: ABI,
      params: {_user: userAddress},

    });

    const jsonResponseRequests = fiveResponse.raw;
    
  const jsonResponseHistory = convertArrayToObjects(fourResponse.raw);


  

    const jsonResponse = {
        name: jsonResponseName,
        balance: jsonResponseBal, 
        dollars: jsonResponseDollars,
        history: jsonResponseHistory,
        requests: jsonResponseRequests
      
    };


    return res.status(200).json({jsonResponse});
  });



  Moralis.start({
    apiKey: process.env.MORALIS_KEY,
  }).then(() => {
    app.listen(port, () => {
      console.log(`Listening for API Calls`);
    });
  });
