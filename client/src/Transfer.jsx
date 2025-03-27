import {useState} from "react";
import server from "./server";
import {sha256} from 'ethereum-cryptography/sha256';
import {toHex} from 'ethereum-cryptography/utils';
import {secp256k1} from 'ethereum-cryptography/secp256k1.js'

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const tx = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
    };

    const tx_hash = toHex(sha256(Buffer.from(JSON.stringify(tx))));

    const signature = secp256k1.sign(Buffer.from(tx_hash, 'hex'), Buffer.from(privateKey, 'hex')).toCompactHex();
    const data = {
        tx,
        tx_hash,
        signature
    }
    try {
      const {
        data: { balance },
      } = await server.post(`send`, data);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
      <form className="container transfer" onSubmit={transfer}>
        <h1>Send Transaction</h1>

        <label>
          Send Amount
          <input
              placeholder="1, 2, 3..."
              value={sendAmount}
              onChange={setValue(setSendAmount)}
          ></input>
        </label>

        <label>
          Recipient
          <input
              placeholder="Type an address, for example: 0x2"
              value={recipient}
              onChange={setValue(setRecipient)}
          ></input>
        </label>

        <label>
          Private key
          <input
              placeholder="Type a private key (won't be shared with backend)"
              value={privateKey}
              onChange={setValue(setPrivateKey)}
          ></input>
        </label>

        <input type="submit" className="button" value="Transfer"/>
      </form>
  );
}

export default Transfer;
