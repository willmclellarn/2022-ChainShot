const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const SHA256 = require("crypto-js/sha256");
const secp = require("@noble/secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// key generation
let privateKey1 = secp.utils.randomPrivateKey();
let privateKey2 = secp.utils.randomPrivateKey();
let privateKey3 = secp.utils.randomPrivateKey();

privateKey1 = Buffer.from(privateKey1).toString("hex");
privateKey2 = Buffer.from(privateKey2).toString("hex");
privateKey3 = Buffer.from(privateKey3).toString("hex");

let publicKey1 = secp.getPublicKey(privateKey1);
let publicKey2 = secp.getPublicKey(privateKey2);
let publicKey3 = secp.getPublicKey(privateKey3);

publicKey1 = secp.utils.bytesToHex(publicKey1);
publicKey2 = secp.utils.bytesToHex(publicKey2);
publicKey3 = secp.utils.bytesToHex(publicKey3);

publicKey1 = "0x" + publicKey1.slice(publicKey1.length - 40);
publicKey2 = "0x" + publicKey2.slice(publicKey2.length - 40);
publicKey3 = "0x" + publicKey3.slice(publicKey3.length - 40);

const balances = {
  [publicKey1]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;
  verifySender(sender, recipient, amount, signature);
});

function verifySender(sender, recipient, amount, signature) {
  console.log(sender);
  console.log(recipient);
  console.log(amount);
  console.log(signature);

  const message = JSON.stringify({
    to: recipient,
    amount: parseInt(amount),
  });

  // hash the independent message
  const messageHash = SHA256(message).toString();

  // recover the public key (just like Ethereum does it) using msgHash, sig, recoveryBit
  const recoveredPublicKey1 = secp
    .recoverPublicKey(messageHash, signature, 0)
    .toString("hex");

  // recover the public key (just like Ethereum does it) using msgHash, sig, recoveryBit
  const recoveredPublicKey2 = secp
    .recoverPublicKey(messageHash, signature, 1)
    .toString("hex");

  // clean up recovered public key so that we can look up if it matches our own server records
  const senderPublicKey1 =
    "0x" + recoveredPublicKey1.slice(recoveredPublicKey1.length - 40);

  // clean up recovered public key so that we can look up if it matches our own server records
  const senderPublicKey2 =
    "0x" + recoveredPublicKey2.slice(recoveredPublicKey2.length - 40);

  let publicKeyMatch = true;

  let senderPublicKey;
  let recoveredPublicKey;

  // if recoverPublicKey() returns correct public key contained in db, else mark false
  if (!balances[senderPublicKey1] && !balances[senderPublicKey2]) {
    console.error(
      "Public key does not match! Make sure you are passing in the correct values!"
    );
    publicKeyMatch = false;
  } else if (!balances[senderPublicKey1] && balances[senderPublicKey2]) {
    senderPublicKey = senderPublicKey2;
    recoveredPublicKey = recoveredPublicKey2;
  } else if (!balances[senderPublicKey2] && balances[senderPublicKey1]) {
    senderPublicKey = senderPublicKey1;
    recoveredPublicKey = recoveredPublicKey1;
  }
  console.log(
    senderPublicKey + " is attempting to send " + amount + " to " + recipient
  );

  // this means whoever sent the signature, given the proper address was re-produced,
  // owns the privkey associated to the funds
  if (publicKeyMatch) {
    balances[senderPublicKey] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[senderPublicKey] });
    console.log(
      senderPublicKey + " has successfully sent " + amount + " to " + recipient
    );
    logBalances();
  } else {
    console.error(
      "Something seems off! Make sure you are passing in the correct values!"
    );
    logBalances();
  }

  // console.log("sender is verified!");

  return true;
}

function logBalances() {
  console.log("Available Accounts");
  console.log("==================");
  console.log(
    `Public Key 1: ${publicKey1} with balance: ${balances[publicKey1]}`
  );
  console.log(
    `Public Key 2: ${publicKey2} with balance: ${balances[publicKey2]}`
  );
  console.log(
    `Public Key 3: ${publicKey3} with balance: ${balances[publicKey3]} \n`
  );

  console.log("Private Keys");
  console.log("==================");
  console.log(`Private Key 1: ${privateKey1}`);
  console.log(`Private Key 2: ${privateKey2}`);
  console.log(`Private Key 3: ${privateKey3}`);
}

app.listen(port, () => {
  logBalances();
  console.log(`Listening on port ${port}!`);
});
