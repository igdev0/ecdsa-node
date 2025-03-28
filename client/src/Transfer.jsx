import {useState} from "react";
import server from "./server";
import {sha256} from 'ethereum-cryptography/sha256';
import {toHex} from 'ethereum-cryptography/utils';
import {secp256k1} from 'ethereum-cryptography/secp256k1.js'

function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const nonce = crypto.randomUUID();
    const recoveryBit = 0;
    const tx = {
        amount: parseInt(sendAmount),
        recipient,
        nonce,
        recoveryBit
    };

    const tx_hash = toHex(sha256(Buffer.from(JSON.stringify(tx))));
    const signature = secp256k1.sign(Buffer.from(tx_hash, 'hex'), Buffer.from(privateKey, 'hex')).addRecoveryBit(recoveryBit).toCompactHex();
    const data = {
        tx,
        tx_hash,
        signature,
        nonce
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
        <input type="submit" className="button" value="Transfer"/>
      </form>
  );
}

export default Transfer;
