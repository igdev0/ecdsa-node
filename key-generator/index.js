
const utils = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

const privateKey = secp.secp256k1.utils.randomPrivateKey();
const publicKey = secp.secp256k1.getPublicKey(privateKey);

console.log(`\n\n🔑 Private Key: ${utils.toHex(privateKey)}`);
console.log(`🔒 Public Key: ${utils.toHex(publicKey)}\n\n`);