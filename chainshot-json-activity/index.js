const axios = require("axios");

// copy-paste your URL from Alchemy
const ALCHEMY_URL =
  "https://eth-mainnet.alchemyapi.io/v2/V2OtnFhJgPo6qxb_KSGkvnjJJO-ex3cr";

axios
  .post(ALCHEMY_URL, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: ["0x95a354E11fF34277EdA9bF64C62CD3307A0aDCE0", "latest"],
  })
  .then((response) => {
    console.log(response.data);
    console.log(response.data.result);
  });
