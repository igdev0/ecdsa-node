import server from "./server";

function Wallet({address, setAddress, balance, setBalance, privateKey, setPrivateKey}) {
    async function onChange(evt) {
        const {value, name} = evt.target;

        switch (name) {
            case "address":
                setAddress(value);
                if (value) {
                    const {
                        data: {balance},
                    } = await server.get(`balance/${value}`);
                    setBalance(balance);
                } else {
                    setBalance(0);
                }
                break;
            case "privateKey":
                setPrivateKey(value);
                break;
        }

    }

    return (
        <div className="container wallet">
            <h1>Your Wallet</h1>

            <label>
                Wallet Address
                <input placeholder="Type an address, for example: 0x1" value={address} name="address"
                       onChange={onChange}></input>
            </label>


            <label>
                Private key
                <input
                    placeholder="Type a private key (won't be shared with backend)"
                    value={privateKey}
                    name="privateKey"
                    onChange={onChange}
                ></input>
            </label>

            <div className="balance">Balance: {balance}</div>
        </div>
    );
}

export default Wallet;
