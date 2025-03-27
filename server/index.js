const express = require("express");
const app = express();
const {sha256} = require("ethereum-cryptography/sha256");
const cors = require("cors");
const {toHex} = require('ethereum-cryptography/utils');
const {secp256k1} = require("ethereum-cryptography/secp256k1")
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x038c2d2c9c2c70ee88f3328cdc667f51beaa88be6cfa582f5c7c2c80171d5cc94c": 100, // b81dbaf98598a649f1c54b6e373662245a235ea00aea694f899cc12c4ad5503f -> private key
  "0x0264ab3fc74caf716d64af17fcc31eb96d6f602ef31c9b0a8ef0b1c9ef467b79ba": 50, // 34e9e27b9da5f14d21442ccdb7251d3d4a3bdd920a141f69e468382db3deaed0
  "0x038c031a779003b6fbaf987fa57626008d159afb15d8c8082bca382c8ba87a1a61": 75, // fe85fa8f84f02acc5e0dd8f1dd6ea0a07b55020e34f7f35a48affc5c2d5199ed
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const {tx, tx_hash, signature} = req.body;
  const { sender, recipient, amount } = tx;
  const hash = toHex(sha256(Buffer.from(JSON.stringify(tx))));
  // 1. Verify that the tx matches the tx_hash by hashing the tx
  if(hash !== tx_hash) {
    return res.status(400).send({message: "The tx does not match the hash"})
  }
  // 2. Verify that the sender is the one who signed the tx
  if(!secp256k1.verify(Buffer.from(signature, 'hex'), Buffer.from(tx_hash, 'hex'), Buffer.from(sender.replace("0x", ""), 'hex'))) {
    return res.status(400).send({message: "Transaction failed verification"})
  }
  // 3. If everything is alright continue
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
