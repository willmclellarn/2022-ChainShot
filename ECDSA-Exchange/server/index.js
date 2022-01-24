const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

// Create and initialize EC context
// (better do it once and reuse it)
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
// const SHA256 = require("crypto-js/sha256");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// key generation
const key = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();
// encode the entire public key as a hexadecimal string
const publicKey = key.getPublic().encode("hex").toString().slice(-40);
const privateKey = key.getPrivate();
const publicKey2 = key2.getPublic().encode("hex").toString().slice(-40);
const publicKey3 = key3.getPublic().encode("hex").toString().slice(-40);
// console.log(publicKey);

const balances = {
  [publicKey]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
};

console.log(`Public Key 1: ${publicKey} with balance: ${balances[publicKey]}`);
// console.log(`Private Key 1: ${privateKey}`);
console.log(
  `Public Key 2: ${publicKey2} with balance: ${balances[publicKey2]}`
);
console.log(
  `Public Key 3: ${publicKey3} with balance: ${balances[publicKey3]}`
);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;
  if (verifySender(sender, recipient, amount, signature)) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else res.send("That's not a verified transaction");
});

function verifySender(sender, recipient, amount, signature) {
  console.log(sender);
  console.log(recipient);
  console.log(amount);
  console.log(signature);

  // console.log("sender is verified!");

  return true;
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
