const secp = require("@noble/secp256k1");
const SHA256 = require("crypto-js/sha256");
(async () => {
  // copy-paste a private key generated when running server/index.js
  const privateKey =
    "73582144eac0f78c863e9ade4815502a034f68f44874de9fdbff542f861d8e7c";

  // copy-paste a separate account from your server db in to
  // send an amount less than your current balance!
  const message = JSON.stringify({
    to: "0XAA7A0698DAA53FC57D1D177741F1F1F20924E04F",
    amount: 7,
  });

  // hash your message
  const messageHash = SHA256(message).toString();

  // use secp.sign() to produce signature and recovery bit (response is an array of two elements)
  const signatureArray = await secp.sign(messageHash, privateKey, {
    recovered: true,
  });
  // separate out returned array into the string signature and the number recoveryBit
  const signature = Buffer.from(signatureArray[0]).toString("hex");
  const recoveryBit = signatureArray[1];

  // use these values in your client!
  console.log("Signature: " + signature);
  console.log("Recovery bit: " + recoveryBit);
})();
