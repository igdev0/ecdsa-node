const express = require("express");
const app = express();
const {sha256} = require("ethereum-cryptography/sha256");
const cors = require("cors");
const {toHex} = require('ethereum-cryptography/utils');
const {secp256k1} = require("ethereum-cryptography/secp256k1")
const env = require("dotenv");
env.config();
const port = 3042;

app.use(cors());
app.use(express.json());

function formatAddress(key) {
  return `0x${key}`
}

const balances = new Map();

const ENV_USERS = [{
  address: formatAddress(process.env.ALICE_PUBLIC_KEY),
  balance: parseInt(process.env.ALICE_WALLET_BALANCE),
}, {
  address: formatAddress(process.env.BOB_PUBLIC_KEY),
  balance: parseInt(process.env.BOB_WALLET_BALANCE),
}, {
  address: formatAddress(process.env.JOHN_PUBLIC_KEY),
  balance: parseInt(process.env.JOHN_WALLET_BALANCE)
}]

ENV_USERS.forEach((user, index) => {
  if(!user.address || !user.balance) {
    throw new Error(`Missing address or balance for env user index: ${index}`)
  }

  balances.set(user.address, user.balance);
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances.get(address) || 0;
  res.send({ balance });
});

const transactions = new Map();

app.post("/send", (req, res) => {
  const {tx, tx_hash, signature, nonce} = req.body;
  const { sender, recipient, amount } = tx;
  if(transactions.get(nonce)) {
    return res.status(409).send({message: 'Replay attack detected: Nonce already used'})
  }
  // 1. Verify the integrity of the transaction
  const hash = toHex(sha256(Buffer.from(JSON.stringify(tx))));
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
  transactions.set(nonce, tx_hash);
  if (balances.get(sender) < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances.set(sender, balances.get(sender) - amount);
    balances.set(recipient, balances.get(recipient) + amount);
    res.send({ balance: balances.get(sender) });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances.get(address)) {
    balances.set(address, 0);
  }
}
